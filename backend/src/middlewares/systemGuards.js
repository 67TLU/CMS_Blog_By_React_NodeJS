import { pool } from '../config/database.js';

let cachedMaintenance = false;
let cacheExpiresAt = 0;
async function isMaintenanceEnabled() {
  if (Date.now() < cacheExpiresAt) return cachedMaintenance;
  try {
    const [rows] = await pool.execute("SELECT value FROM settings WHERE `key`='maintenance_mode' AND scope='PUBLIC' LIMIT 1");
    const value = String(rows[0]?.value ?? 'false').toLowerCase();
    cachedMaintenance = ['1','true','yes','on'].includes(value);
    cacheExpiresAt = Date.now() + 30_000;
  } catch {
    // A temporary settings read failure must not take the entire API offline.
    cacheExpiresAt = Date.now() + 5_000;
  }
  return cachedMaintenance;
}
export async function maintenanceMode(req,res,next) {
  const path = req.path || '';
  if (path.startsWith('/auth/') || path.startsWith('/admin/') || path === '/settings/public' || path === '/system/health') return next();
  if (await isMaintenanceEnabled()) return res.status(503).json({success:false,error:{code:'MAINTENANCE',message:'Hệ thống đang bảo trì. Vui lòng quay lại sau.'}});
  return next();
}
export async function registrationEnabled(req,res,next) {
  try {
    const [rows] = await pool.execute("SELECT value FROM settings WHERE `key`='enable_register' AND scope='PUBLIC' LIMIT 1");
    const value=String(rows[0]?.value ?? 'true').toLowerCase();
    if(['0','false','no','off'].includes(value)) return res.status(403).json({success:false,error:{code:'REGISTRATION_DISABLED',message:'Chức năng đăng ký hiện đang tắt.'}});
    return next();
  } catch(error) { return next(error); }
}
