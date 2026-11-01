import { pool } from "../config/database.js";

export async function countAdminCategories({
  q,
  status,
  parentId,
}) {
  const conditions = [];
  const params = [];

  if (q) {
    conditions.push("c.name LIKE ?");
    params.push(`%${q}%`);
  }

  if (status) {
    conditions.push("c.status = ?");
    params.push(status);
  }

  if (parentId === null) {
    conditions.push("c.parent_id IS NULL");
  } else if (parentId !== undefined) {
    conditions.push("c.parent_id = ?");
    params.push(parentId);
  }

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";

  const [rows] = await pool.execute(
    `
      SELECT COUNT(*) AS total
      FROM categories c
      ${whereClause}
    `,
    params
  );

  return Number(rows[0].total);
}

export async function findAdminCategories({
  q,
  status,
  parentId,
  limit,
  offset,
}) {
  const conditions = [];
  const params = [];

  if (q) {
    conditions.push("c.name LIKE ?");
    params.push(`%${q}%`);
  }

  if (status) {
    conditions.push("c.status = ?");
    params.push(status);
  }

  if (parentId === null) {
    conditions.push("c.parent_id IS NULL");
  } else if (parentId !== undefined) {
    conditions.push("c.parent_id = ?");
    params.push(parentId);
  }

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";

  const sql = `
    SELECT
      c.id,
      c.name,
      c.slug,
      c.parent_id AS parentId,
      parent.name AS parentName,
      c.description,
      c.position,
      c.status,
      c.created_at AS createdAt,
      c.updated_at AS updatedAt
    FROM categories c
    LEFT JOIN categories parent
      ON parent.id = c.parent_id
    ${whereClause}
    ORDER BY c.position ASC, c.id ASC
    LIMIT ? OFFSET ?
  `;

  const [rows] = await pool.execute(sql, [
    ...params,
    limit,
    offset,
  ]);

  return rows;
}
export async function findAdminCategoryById(id) {
  const sql = `
    SELECT
      c.id,
      c.name,
      c.slug,
      c.parent_id AS parentId,
      parent.name AS parentName,
      c.description,
      c.position,
      c.status,
      c.created_at AS createdAt,
      c.updated_at AS updatedAt
    FROM categories c
    LEFT JOIN categories parent
      ON parent.id = c.parent_id
    WHERE c.id = ?
    LIMIT 1
  `;

  const [rows] = await pool.execute(sql, [id]);

  return rows[0] ?? null;
}
export async function createAdminCategory({
  name,
  slug,
  parentId,
  description,
  position,
  status,
}) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Kiểm tra danh mục cha nếu parentId khác null.
    if (parentId !== null) {
      const [parents] = await connection.execute(
        `
          SELECT id
          FROM categories
          WHERE id = ?
          FOR UPDATE
        `,
        [parentId]
      );

      if (parents.length === 0) {
        await connection.rollback();
        return { error: "PARENT_NOT_FOUND" };
      }
    }

    // Tạo danh mục.
    const [result] = await connection.execute(
      `
        INSERT INTO categories (
          name,
          slug,
          parent_id,
          description,
          position,
          status
        )
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        name,
        slug,
        parentId,
        description,
        position,
        status,
      ]
    );

    const categoryId = result.insertId;

    // Lấy lại danh mục vừa tạo.
    const [rows] = await connection.execute(
      `
        SELECT
          c.id,
          c.name,
          c.slug,
          c.parent_id AS parentId,
          parent.name AS parentName,
          c.description,
          c.position,
          c.status,
          c.created_at AS createdAt,
          c.updated_at AS updatedAt
        FROM categories c
        LEFT JOIN categories parent
          ON parent.id = c.parent_id
        WHERE c.id = ?
        LIMIT 1
      `,
      [categoryId]
    );

    await connection.commit();

    return rows[0];
  } catch (error) {
    await connection.rollback();

    // MySQL: vi phạm UNIQUE KEY.
    if (error.code === "ER_DUP_ENTRY") {
      return { error: "SLUG_ALREADY_EXISTS" };
    }

    throw error;
  } finally {
    connection.release();
  }
}
export async function updateAdminCategory(id, data) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Khóa và lấy danh mục hiện tại.
    const [currentRows] = await connection.execute(
      `
        SELECT id
        FROM categories
        WHERE id = ?
        FOR UPDATE
      `,
      [id]
    );

    if (currentRows.length === 0) {
      await connection.rollback();
      return { error: "CATEGORY_NOT_FOUND" };
    }

    // Kiểm tra danh mục cha nếu người dùng muốn thay đổi parentId.
    if (
      Object.hasOwn(data, "parentId") &&
      data.parentId !== null
    ) {
      // Không cho danh mục tự làm cha của chính nó.
      if (Number(data.parentId) === Number(id)) {
        await connection.rollback();
        return { error: "CATEGORY_CANNOT_BE_OWN_PARENT" };
      }

      const [parentRows] = await connection.execute(
        `
          SELECT id
          FROM categories
          WHERE id = ?
          FOR UPDATE
        `,
        [data.parentId]
      );

      if (parentRows.length === 0) {
        await connection.rollback();
        return { error: "PARENT_NOT_FOUND" };
      }
    }

    // Chỉ cập nhật những trường được gửi lên.
    const columnMap = {
      name: "name",
      slug: "slug",
      parentId: "parent_id",
      description: "description",
      position: "position",
      status: "status",
    };

    const fields = [];
    const values = [];

    for (const [key, column] of Object.entries(columnMap)) {
      if (Object.hasOwn(data, key)) {
        fields.push(`\`${column}\` = ?`);
        values.push(data[key]);
      }
    }

    values.push(id);

    await connection.execute(
      `
        UPDATE categories
        SET ${fields.join(", ")}
        WHERE id = ?
      `,
      values
    );

    // Lấy dữ liệu sau cập nhật.
    const [updatedRows] = await connection.execute(
      `
        SELECT
          c.id,
          c.name,
          c.slug,
          c.parent_id AS parentId,
          parent.name AS parentName,
          c.description,
          c.position,
          c.status,
          c.created_at AS createdAt,
          c.updated_at AS updatedAt
        FROM categories c
        LEFT JOIN categories parent
          ON parent.id = c.parent_id
        WHERE c.id = ?
        LIMIT 1
      `,
      [id]
    );

    await connection.commit();

    return updatedRows[0];
  } catch (error) {
    await connection.rollback();

    if (error.code === "ER_DUP_ENTRY") {
      return { error: "SLUG_ALREADY_EXISTS" };
    }

    throw error;
  } finally {
    connection.release();
  }
}
export async function deleteAdminCategory(id) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Kiểm tra và khóa danh mục cần xóa.
    const [categoryRows] = await connection.execute(
      `
        SELECT id
        FROM categories
        WHERE id = ?
        FOR UPDATE
      `,
      [id]
    );

    if (categoryRows.length === 0) {
      await connection.rollback();
      return { error: "CATEGORY_NOT_FOUND" };
    }

    // 2. Kiểm tra danh mục con.
    const [children] = await connection.execute(
      `
        SELECT id
        FROM categories
        WHERE parent_id = ?
        LIMIT 1
      `,
      [id]
    );

    if (children.length > 0) {
      await connection.rollback();
      return { error: "CATEGORY_HAS_CHILDREN" };
    }

    // 3. Kiểm tra bài viết đang tham chiếu danh mục.
    // Không bỏ qua bài viết đã xóa mềm vì chúng vẫn có thể
    // tham chiếu đến danh mục qua khóa ngoại.
    const [articles] = await connection.execute(
      `
        SELECT id
        FROM articles
        WHERE category_id = ?
        LIMIT 1
      `,
      [id]
    );

    if (articles.length > 0) {
      await connection.rollback();
      return { error: "CATEGORY_HAS_ARTICLES" };
    }

    // 4. Chỉ xóa khi không còn danh mục con hoặc bài viết.
    await connection.execute(
      `
        DELETE FROM categories
        WHERE id = ?
      `,
      [id]
    );

    await connection.commit();

    return {
      id: Number(id),
      deleted: true,
    };
  } catch (error) {
    await connection.rollback();

    // Phòng trường hợp khóa ngoại bị vi phạm.
    if (error.code === "ER_ROW_IS_REFERENCED_2") {
      return { error: "CATEGORY_IN_USE" };
    }

    throw error;
  } finally {
    connection.release();
  }
}