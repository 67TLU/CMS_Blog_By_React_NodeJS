import { pool } from "../config/database.js";

export async function findUserByEmail(email) {
  const [rows] = await pool.execute(
    `
      SELECT
        u.id,
        u.name,
        u.email,
        u.password_hash,
        u.avatar_url,
        u.bio,
        u.expertise,
        u.role_id,
        u.status,
        u.email_verified,
        r.code AS role
      FROM users AS u
      INNER JOIN roles AS r
        ON r.id = u.role_id
      WHERE u.email = ?
      LIMIT 1
    `,
    [email],
  );

  return rows[0] ?? null;
}

export async function findUserById(id) {
  const [rows] = await pool.execute(
    `
      SELECT
        u.id,
        u.name,
        u.email,
        u.avatar_url,
        u.bio,
        u.expertise,
        u.role_id,
        u.status,
        u.email_verified,
        r.code AS role
      FROM users AS u
      INNER JOIN roles AS r
        ON r.id = u.role_id
      WHERE u.id = ?
      LIMIT 1
    `,
    [id],
  );

  return rows[0] ?? null;
}

export async function findRoleIdByCode(roleCode) {
  const [rows] = await pool.execute(
    `
      SELECT id
      FROM roles
      WHERE code = ?
      LIMIT 1
    `,
    [roleCode],
  );

  return rows[0]?.id ?? null;
}

export async function findPermissionsByRoleId(roleId) {
  const [rows] = await pool.execute(
    `
      SELECT p.key_name
      FROM role_permissions AS rp
      INNER JOIN permissions AS p
        ON p.id = rp.permission_id
      WHERE rp.role_id = ?
      ORDER BY p.id ASC
    `,
    [roleId],
  );

  return rows.map((row) => row.key_name);
}

export async function createUser({
  name,
  email,
  passwordHash,
  roleId,
}) {
  const [result] = await pool.execute(
    `
      INSERT INTO users (
        name,
        email,
        password_hash,
        role_id,
        status,
        email_verified
      )
      VALUES (?, ?, ?, ?, 'ACTIVE', 0)
    `,
    [name, email, passwordHash, roleId],
  );

  return result.insertId;
}

export async function isRegistrationEnabled() {
  const [rows] = await pool.execute(
    `
      SELECT value
      FROM settings
      WHERE \`key\` = 'enable_register'
      LIMIT 1
    `,
  );

  // Không cho đăng ký nếu chưa cấu hình hoặc giá trị không phải true.
  return String(rows[0]?.value ?? "").toLowerCase() === "true";
}

export async function createRefreshToken({
  userId,
  tokenHash,
  expiresAt,
}) {
  const [result] = await pool.execute(
    `
      INSERT INTO refresh_tokens (
        user_id,
        token_hash,
        expires_at,
        revoked
      )
      VALUES (?, ?, ?, 0)
    `,
    [userId, tokenHash, expiresAt],
  );

  return result.insertId;
}
export async function consumeRefreshTokenByHash(tokenHash) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [rows] = await connection.execute(
      `
        SELECT id, user_id
        FROM refresh_tokens
        WHERE token_hash = ?
          AND revoked = 0
          AND expires_at > NOW()
        LIMIT 1
        FOR UPDATE
      `,
      [tokenHash],
    );

    const tokenRecord = rows[0];

    if (!tokenRecord) {
      await connection.rollback();
      return null;
    }

    const [result] = await connection.execute(
      `
        UPDATE refresh_tokens
        SET revoked = 1
        WHERE id = ?
          AND revoked = 0
      `,
      [tokenRecord.id],
    );

    if (result.affectedRows !== 1) {
      await connection.rollback();
      return null;
    }

    await connection.commit();

    return {
      tokenId: tokenRecord.id,
      userId: tokenRecord.user_id,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function revokeRefreshTokenByHash(tokenHash) {
  const [result] = await pool.execute(
    `
      UPDATE refresh_tokens
      SET revoked = 1
      WHERE token_hash = ?
        AND revoked = 0
    `,
    [tokenHash],
  );

  return result.affectedRows > 0;
}
export async function refreshUserSession(refreshToken) {
  if (
    typeof refreshToken !== "string" ||
    !refreshToken.startsWith("rt_")
  ) {
    throw new ApiError(
      401,
      "UNAUTHENTICATED",
      "Refresh token không hợp lệ hoặc đã hết hạn.",
    );
  }

  const tokenHash = hashRefreshToken(refreshToken);

  // Thu hồi token cũ ngay trong transaction.
  // Token đã sử dụng hoặc đã hết hạn sẽ không được chấp nhận.
  const consumedToken = await consumeRefreshTokenByHash(tokenHash);

  if (!consumedToken) {
    throw new ApiError(
      401,
      "UNAUTHENTICATED",
      "Refresh token không hợp lệ hoặc đã hết hạn.",
    );
  }

  const user = await findUserById(consumedToken.userId);

  if (!user || user.status !== "ACTIVE") {
    throw new ApiError(
      401,
      "UNAUTHENTICATED",
      "Phiên đăng nhập không còn hợp lệ.",
    );
  }

  const permissions = await findPermissionsByRoleId(user.role_id);
  const tokens = await issueTokens(user);

  return {
    user: toPublicUser(user, permissions),
    ...tokens,
  };
}

export async function logoutUser(refreshToken) {
  if (
    typeof refreshToken !== "string" ||
    !refreshToken.startsWith("rt_")
  ) {
    // Logout vẫn thành công về mặt giao diện nếu cookie đã mất.
    return;
  }

  const tokenHash = hashRefreshToken(refreshToken);

  await revokeRefreshTokenByHash(tokenHash);
}