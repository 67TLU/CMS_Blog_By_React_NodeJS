import mysql from "mysql2/promise";
import dotenv from "dotenv";

// Đọc biến môi trường từ file .env
dotenv.config();

const requiredEnv = [
  "DB_HOST",
  "DB_PORT",
  "DB_USER",
  "DB_PASSWORD",
  "DB_NAME",
];

for (const key of requiredEnv) {
  if (process.env[key] === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

// Tạo connection pool
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

  charset: "utf8mb4",
});

// Kiểm tra kết nối database
export async function testDatabaseConnection() {
  let connection;

  try {
    connection = await pool.getConnection();

    await connection.ping();

    console.log("MySQL connected successfully.");
  } finally {
    connection?.release();
  }
}