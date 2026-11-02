import mysql from "mysql2/promise";
import dotenv from "dotenv";

// Đọc biến môi trường từ file .env
dotenv.config();

const requiredEnv = ["DB_HOST", "DB_PORT", "DB_USER", "DB_PASSWORD", "DB_NAME"];

for (const key of requiredEnv) {
  if (process.env[key] === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

// Tạo connection pool — bắt buộc dùng utf8mb4 để tránh lỗi font ký tự lạ
export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10,
  idleTimeout: 60000,
  queueLimit: 0,

  // Ép buộc charset utf8mb4 cho mọi kết nối (tránh cp850/latin1)
  charset: "utf8mb4",
});

// SET NAMES sau mỗi kết nối mới từ pool
pool.on("connection", (connection) => {
  connection.query("SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci");
});

// Kiểm tra kết nối database
export async function testDatabaseConnection() {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.ping();
    console.log("MySQL connected successfully (charset: utf8mb4).");
  } finally {
    connection?.release();
  }
}