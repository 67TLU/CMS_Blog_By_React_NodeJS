import app from "./app.js";
import { publishDueArticles } from "./services/scheduledPublisher.js";
import {
  pool,
  testDatabaseConnection,
} from "./config/database.js";

// ========================================
// 1. SERVER CONFIGURATION
// ========================================

const PORT = Number(process.env.PORT || 4000);

let server;
let isShuttingDown = false;
let schedulerTimer;

// ========================================
// 2. START SERVER
// ========================================

async function startServer() {
  try {
    // Kiểm tra MySQL trước khi khởi động HTTP server.
    await testDatabaseConnection();

    server = app.listen(PORT, () => {
      console.log("------------------------------------");
      console.log("Portal News Backend");
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`Server: http://localhost:${PORT}`);
      console.log(`Health: http://localhost:${PORT}/health`);
      console.log(`API: http://localhost:${PORT}/api`);
      console.log("------------------------------------");
    });

    // Publish scheduled articles every 30 seconds. The task is non-blocking for HTTP requests.
    schedulerTimer = setInterval(() => {
      publishDueArticles().catch((error) => console.error("Scheduled publishing failed:", error.message));
    }, 30_000);
    schedulerTimer.unref();
    publishDueArticles().catch((error) => console.error("Initial scheduled publishing failed:", error.message));

    server.on("error", (error) => {
      console.error("HTTP server error:", error.message);
      process.exitCode = 1;
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);

    await pool.end().catch(() => {});

    process.exitCode = 1;
  }
}

// ========================================
// 3. GRACEFUL SHUTDOWN
// ========================================

async function shutdown(signal) {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;

  console.log(`\nReceived ${signal}. Shutting down...`);

  // Tránh chờ vô thời hạn nếu có kết nối chưa kết thúc.
  const forceExitTimer = setTimeout(() => {
    console.error("Shutdown timed out. Forcing exit.");
    process.exit(1);
  }, 10000);

  forceExitTimer.unref();

  try {
    if (schedulerTimer) clearInterval(schedulerTimer);
    if (server) {
      await new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      });
    }

    // Đóng các kết nối thuộc connection pool.
    await pool.end();

    console.log("Server and database connections closed.");
    process.exitCode = 0;
  } catch (error) {
    console.error("Error during shutdown:", error.message);
    process.exitCode = 1;
  } finally {
    clearTimeout(forceExitTimer);
  }
}

// ========================================
// 4. PROCESS SIGNALS
// ========================================

process.once("SIGINT", () => {
  void shutdown("SIGINT");
});

process.once("SIGTERM", () => {
  void shutdown("SIGTERM");
});

// ========================================
// 5. RUN
// ========================================

void startServer();