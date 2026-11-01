import crypto from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs/promises';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { pool } from '../config/database.js';
import { ApiError } from '../utils/ApiError.js';
import { sendSuccess, sendCreated, sendPaginated } from '../utils/response.js';

const q = (sql, params = []) => pool.execute(sql, params);
const num = (value, fallback = 1) => Number.isInteger(Number(value)) && Number(value) > 0 ? Number(value) : fallback;
const pageInfo = (req) => ({ page: Math.min(num(req.query.page, 1), 1000000), limit: Math.min(num(req.query.limit, 20), 100) });
const publicUser = (u) => ({ id: u.id, name: u.name, email: u.email, avatar: u.avatar_url ?? null, bio: u.bio ?? null, expertise: u.expertise ?? null, role: u.role, status: u.status, createdAt: u.created_at });
const assertId = (id) => { if (!/^[1-9]\d*$/.test(String(id))) throw new ApiError(400, 'INVALID_ID', 'ID không hợp lệ.'); return Number(id); };
const parseBody = (body, allowed) => Object.fromEntries(Object.entries(body ?? {}).filter(([k,v]) => allowed.includes(k) && v !== undefined));
const toSlug = (s) => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0, 180);
async function audit(req, action, entity = null, entityId = null, status = 'SUCCESS') {
  try { await q('INSERT INTO audit_logs (user_id,user_label,action,entity,entity_id,ip,status) VALUES (?,?,?,?,?,?,?)', [req.user?.id ?? null, req.user?.name ?? 'Unknown', action, entity, entityId == null ? null : String(entityId), String(req.ip || '').slice(0,45), status]); } catch (e) { req.log?.warn({err:e}, 'audit log insert failed'); }
}
function boolValue(value) { return value === true || value === 1 || value === '1' || value === 'true'; }
function getMailer() {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) return nodemailer.createTransport({ host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || 587), secure: process.env.SMTP_SECURE === 'true', auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } });
  if (process.env.SMTP_URL) return nodemailer.createTransport(process.env.SMTP_URL);
  return null;
}

// ---------------- AUTH: password reset + Google OAuth ----------------
export async function forgotPassword(req,res) {
  const email = String(req.body?.email || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new ApiError(400,'VALIDATION_ERROR','Email không hợp lệ.');
  const [users] = await q('SELECT id,name,email FROM users WHERE email=? LIMIT 1',[email]);
  if (users.length) {
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    await q('UPDATE password_resets SET used=1 WHERE user_id=? AND used=0',[users[0].id]);
    await q('INSERT INTO password_resets (user_id,token_hash,expires_at) VALUES (?,?,DATE_ADD(NOW(), INTERVAL 15 MINUTE))',[users[0].id,tokenHash]);
    const frontend = (process.env.FRONTEND_URL || 'http://localhost:5173').split(',')[0].trim();
    const link = `${frontend.replace(/\/$/,'')}/reset-password?token=${encodeURIComponent(token)}`;
    const mailer = getMailer();
    if (mailer) {
      try {
        await mailer.sendMail({ from: process.env.SMTP_FROM || process.env.SMTP_USER, to: users[0].email, subject: 'Khôi phục mật khẩu Portal News', text: `Xin chào ${users[0].name},\n\nMở liên kết sau để đặt lại mật khẩu (hết hạn sau 15 phút):\n${link}\n\nNếu bạn không yêu cầu, hãy bỏ qua email này.` });
      } catch (mailError) {
        req.log?.error({ err: mailError }, 'Password reset email delivery failed');
      }
    } else if (process.env.NODE_ENV === 'development') {
      req.log?.warn({ resetLink: link }, 'SMTP chưa cấu hình; link reset chỉ được ghi log trong development');
    }
  }
  return sendSuccess(res,{message:'Nếu email tồn tại, liên kết khôi phục sẽ được gửi tới hộp thư của bạn.'});
}
export async function resetPassword(req,res) {
  const token = String(req.body?.token || ''); const password = String(req.body?.password || '');
  if (token.length < 32 || password.length < 8 || password.length > 128) throw new ApiError(400,'VALIDATION_ERROR','Token không hợp lệ hoặc mật khẩu phải có từ 8 đến 128 ký tự.');
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [rows] = await conn.execute('SELECT id,user_id FROM password_resets WHERE token_hash=? AND used=0 AND expires_at>NOW() LIMIT 1 FOR UPDATE',[hash]);
    if (!rows.length) throw new ApiError(400,'PASSWORD_RESET_INVALID','Token sai, hết hạn hoặc đã được sử dụng.');
    const passwordHash = await bcrypt.hash(password, 12);
    await conn.execute('UPDATE users SET password_hash=? WHERE id=?',[passwordHash,rows[0].user_id]);
    await conn.execute('UPDATE password_resets SET used=1 WHERE user_id=?',[rows[0].user_id]);
    await conn.execute('UPDATE refresh_tokens SET revoked=1 WHERE user_id=?',[rows[0].user_id]);
    await conn.commit();
    return sendSuccess(res,{message:'Đặt lại mật khẩu thành công.'});
  } catch (e) { await conn.rollback(); throw e; } finally { conn.release(); }
}
let googleStrategyConfigured = false;
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_CALLBACK_URL) {
  passport.use('google', new GoogleStrategy({ clientID:process.env.GOOGLE_CLIENT_ID, clientSecret:process.env.GOOGLE_CLIENT_SECRET, callbackURL:process.env.GOOGLE_CALLBACK_URL }, async (_accessToken,_refreshToken,profile,done) => {
    try {
      const email = profile.emails?.[0]?.value?.toLowerCase();
      if (!email) return done(new Error('Google account did not provide an email.'));
      let [rows] = await q('SELECT u.*,r.code AS role FROM users u JOIN roles r ON r.id=u.role_id WHERE u.google_id=? OR u.email=? LIMIT 1',[profile.id,email]);
      let user = rows[0];
      if (!user) {
        const [roles] = await q("SELECT id FROM roles WHERE code='SUBSCRIBER' LIMIT 1");
        if (!roles.length) return done(new Error('Role SUBSCRIBER is missing.'));
        const [result] = await q('INSERT INTO users (name,email,avatar_url,role_id,email_verified,google_id) VALUES (?,?,?,?,1,?)',[profile.displayName || email.split('@')[0],email,profile.photos?.[0]?.value || null,roles[0].id,profile.id]);
        [rows] = await q('SELECT u.*,r.code AS role FROM users u JOIN roles r ON r.id=u.role_id WHERE u.id=?',[result.insertId]); user = rows[0];
      } else if (!user.google_id) { await q('UPDATE users SET google_id=?,email_verified=1 WHERE id=?',[profile.id,user.id]); user.google_id = profile.id; }
      if (user.status !== 'ACTIVE') return done(null,false,{message:'Tài khoản đang bị khóa.'});
      return done(null,user);
    } catch (e) { return done(e); }
  }));
  googleStrategyConfigured = true;
}
export function googleAuthStart(req,res,next) { if (!googleStrategyConfigured) return next(new ApiError(503,'GOOGLE_OAUTH_NOT_CONFIGURED','Chưa cấu hình GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET và GOOGLE_CALLBACK_URL.')); return passport.authenticate('google',{scope:['profile','email'],session:false})(req,res,next); }
export function googleAuthCallback(req,res,next) {
  if (!googleStrategyConfigured) return next(new ApiError(503,'GOOGLE_OAUTH_NOT_CONFIGURED','Google OAuth chưa được cấu hình.'));
  return passport.authenticate('google',{session:false,failureRedirect:`${(process.env.FRONTEND_URL||'http://localhost:5173').split(',')[0]}/login?error=google`},async (err,user) => {
    try {
      if (err) return next(err);
      if (!user) return res.redirect(`${(process.env.FRONTEND_URL||'http://localhost:5173').split(',')[0]}/login?error=google`);
      const accessSecret=process.env.JWT_ACCESS_SECRET, refreshSecret=process.env.JWT_REFRESH_SECRET;
      if (!accessSecret || !refreshSecret) throw new Error('JWT secrets are not configured.');
      const accessToken=jwt.sign({sub:String(user.id)},accessSecret,{expiresIn:process.env.JWT_ACCESS_EXPIRES_IN||'15m',algorithm:'HS256'});
      const refreshToken=`rt_${crypto.randomBytes(48).toString('hex')}`;
      const refreshHash=crypto.createHash('sha256').update(refreshToken).digest('hex');
      const exp=process.env.JWT_REFRESH_EXPIRES_IN||'7d'; const m=exp.match(/^(\d+)(m|h|d)$/); const ms=m?Number(m[1])*({m:60000,h:3600000,d:86400000}[m[2]]):7*86400000;
      await q('INSERT INTO refresh_tokens (user_id,token_hash,expires_at) VALUES (?,?,?)',[user.id,refreshHash,new Date(Date.now()+ms)]);
      res.cookie('refreshToken',refreshToken,{httpOnly:true,secure:process.env.COOKIE_SECURE==='true',sameSite:(process.env.COOKIE_SAME_SITE||'lax').toLowerCase(),path:'/api/auth',maxAge:ms});
      await q('UPDATE users SET last_login_at=NOW() WHERE id=?',[user.id]);
      const frontend=(process.env.FRONTEND_URL||'http://localhost:5173').split(',')[0].trim();
      return res.redirect(`${frontend.replace(/\/$/,'')}/login#oauth=success&accessToken=${encodeURIComponent(accessToken)}`);
    } catch(e) { return next(e); }
  })(req,res,next);
}

// ---------------- USER CENTER ----------------
export async function getMyProfile(req,res) {
  const id=req.user.id;
  const [[u]] = await q('SELECT u.id,u.name,u.email,u.avatar_url,u.bio,u.expertise,u.created_at,r.code AS role FROM users u JOIN roles r ON r.id=u.role_id WHERE u.id=?',[id]);
  if(!u) throw new ApiError(404,'USER_NOT_FOUND','Không tìm thấy tài khoản.');
  const [[stats]] = await q(`SELECT (SELECT COUNT(*) FROM bookmarks WHERE user_id=?) bookmarks,(SELECT COUNT(*) FROM reading_history WHERE user_id=?) history,(SELECT COUNT(*) FROM notifications WHERE user_id=?) notifications,(SELECT COUNT(*) FROM comments WHERE user_id=? AND status<>'DELETED') comments`,[id,id,id,id]);
  return sendSuccess(res,{...publicUser({...u,status:'ACTIVE'}),stats});
}
export async function updateMyProfile(req,res) {
  const data=parseBody(req.body,['name','bio','expertise']);
  if(!Object.keys(data).length) throw new ApiError(400,'VALIDATION_ERROR','Cần cung cấp ít nhất một trường để cập nhật.');
  if(data.name !== undefined && (typeof data.name!=='string'||!data.name.trim()||data.name.trim().length>100)) throw new ApiError(400,'VALIDATION_ERROR','name phải có từ 1 đến 100 ký tự.');
  if(data.bio !== undefined && data.bio!==null && (typeof data.bio!=='string'||data.bio.length>5000)) throw new ApiError(400,'VALIDATION_ERROR','bio tối đa 5000 ký tự.');
  if(data.expertise !== undefined && data.expertise!==null && (typeof data.expertise!=='string'||data.expertise.length>128)) throw new ApiError(400,'VALIDATION_ERROR','expertise tối đa 128 ký tự.');
  const fields=[],values=[]; for(const [k,v] of Object.entries(data)){fields.push(`${({name:'name',bio:'bio',expertise:'expertise'})[k]}=?`);values.push(k==='name'?v.trim():v);}
  await q(`UPDATE users SET ${fields.join(',')} WHERE id=?`,[...values,req.user.id]);
  const [[u]]=await q('SELECT u.id,u.name,u.email,u.avatar_url,u.bio,u.expertise,u.status,u.created_at,r.code AS role FROM users u JOIN roles r ON r.id=u.role_id WHERE u.id=?',[req.user.id]);
  return sendSuccess(res,publicUser(u));
}
export async function updateMyAvatar(req,res) {
  if(!req.file) throw new ApiError(400,'FILE_REQUIRED','Vui lòng tải lên file avatar.');
  const url=`${(process.env.PUBLIC_BASE_URL||'').replace(/\/$/,'')}/Uploads/${req.file.filename}`;
  await q('UPDATE users SET avatar_url=? WHERE id=?',[url,req.user.id]);
  return sendSuccess(res,{avatarUrl:url});
}
export async function getMyBookmarks(req,res) {
  const {page,limit}=pageInfo(req),offset=(page-1)*limit;
  const [[c]]=await q('SELECT COUNT(*) total FROM bookmarks b JOIN articles a ON a.id=b.article_id WHERE b.user_id=? AND a.status=\'PUBLISHED\' AND a.deleted_at IS NULL',[req.user.id]);
  const [rows]=await q(`SELECT a.id,a.slug,a.title,a.excerpt,a.cover_image AS coverImage,a.views,a.likes_count AS likesCount,a.comments_count AS commentsCount,a.published_at AS publishedAt,c.name AS category,u.name AS author,b.created_at AS bookmarkedAt FROM bookmarks b JOIN articles a ON a.id=b.article_id JOIN categories c ON c.id=a.category_id JOIN users u ON u.id=a.author_id WHERE b.user_id=? AND a.status='PUBLISHED' AND a.deleted_at IS NULL ORDER BY b.created_at DESC LIMIT ? OFFSET ?`,[req.user.id,limit,offset]);
  return sendPaginated(res,{items:rows}, {page,limit,totalItems:c.total,totalPages:Math.ceil(c.total/limit)});
}
export async function getMyHistory(req,res) {
  const {page,limit}=pageInfo(req),offset=(page-1)*limit;
  const [[c]]=await q('SELECT COUNT(*) total FROM reading_history WHERE user_id=?',[req.user.id]);
  const [items]=await q(`SELECT h.article_id AS articleId,h.read_at AS readAt,a.slug,a.title,a.excerpt,a.cover_image AS coverImage,a.published_at AS publishedAt,u.name AS author,c.name AS category FROM reading_history h JOIN articles a ON a.id=h.article_id JOIN users u ON u.id=a.author_id JOIN categories c ON c.id=a.category_id WHERE h.user_id=? AND a.deleted_at IS NULL ORDER BY h.read_at DESC LIMIT ? OFFSET ?`,[req.user.id,limit,offset]);
  return sendPaginated(res,{items},{page,limit,totalItems:c.total,totalPages:Math.ceil(c.total/limit)});
}
export async function clearMyHistory(req,res) { const [r]=await q('DELETE FROM reading_history WHERE user_id=?',[req.user.id]); return sendSuccess(res,{message:'Đã xóa lịch sử đọc.',deletedCount:r.affectedRows}); }
export async function deleteHistoryItem(req,res) { const id=assertId(req.params.articleId); const [r]=await q('DELETE FROM reading_history WHERE user_id=? AND article_id=?',[req.user.id,id]); if(!r.affectedRows) throw new ApiError(404,'HISTORY_NOT_FOUND','Không tìm thấy bài viết trong lịch sử.'); return sendSuccess(res,{message:'Đã xóa bài viết khỏi lịch sử.'}); }
export async function getMyNotifications(req,res) {
  const {page,limit}=pageInfo(req),offset=(page-1)*limit; const unreadOnly=String(req.query.unread||'')==='true';
  const where=unreadOnly?' AND is_read=0':'';
  const [[c]]=await q(`SELECT COUNT(*) total FROM notifications WHERE user_id=?${where}`,[req.user.id]);
  const [items]=await q(`SELECT id,type,title,body,link,is_read AS isRead,created_at AS createdAt FROM notifications WHERE user_id=?${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,[req.user.id,limit,offset]);
  return sendPaginated(res,{items},{page,limit,totalItems:c.total,totalPages:Math.ceil(c.total/limit)});
}
export async function markNotificationRead(req,res) { const id=assertId(req.params.id); const [r]=await q('UPDATE notifications SET is_read=1 WHERE id=? AND user_id=?',[id,req.user.id]); if(!r.affectedRows) throw new ApiError(404,'NOTIFICATION_NOT_FOUND','Không tìm thấy thông báo.'); return sendSuccess(res,{id,isRead:true}); }
export async function markAllNotificationsRead(req,res) { const [r]=await q('UPDATE notifications SET is_read=1 WHERE user_id=? AND is_read=0',[req.user.id]); return sendSuccess(res,{message:'Đã đánh dấu tất cả thông báo là đã đọc.',updatedCount:r.affectedRows}); }
export async function followAuthor(req,res) { const authorId=assertId(req.params.authorId); if(authorId===Number(req.user.id)) throw new ApiError(400,'CANNOT_FOLLOW_SELF','Bạn không thể tự theo dõi chính mình.'); const [[u]]=await q('SELECT id,role_id FROM users WHERE id=? AND status=\'ACTIVE\'',[authorId]); if(!u) throw new ApiError(404,'AUTHOR_NOT_FOUND','Không tìm thấy tác giả.'); await q('INSERT IGNORE INTO follows (follower_id,author_id) VALUES (?,?)',[req.user.id,authorId]); return sendSuccess(res,{authorId,isFollowing:true}); }
export async function unfollowAuthor(req,res) { const authorId=assertId(req.params.authorId); await q('DELETE FROM follows WHERE follower_id=? AND author_id=?',[req.user.id,authorId]); return sendSuccess(res,{authorId,isFollowing:false}); }

// ---------------- AUTHOR ARTICLES / STUDIO ----------------
function authorCanEdit(req, article) { return ['ADMIN','EDITOR'].includes(req.user.role) || Number(article.author_id)===Number(req.user.id); }
async function getOwnedArticle(req, id) { const [[a]]=await q('SELECT * FROM articles WHERE id=? AND deleted_at IS NULL',[id]); if(!a) throw new ApiError(404,'ARTICLE_NOT_FOUND','Không tìm thấy bài viết.'); if(!authorCanEdit(req,a)) throw new ApiError(403,'FORBIDDEN','Bạn không có quyền sửa bài viết này.'); return a; }
export async function createAuthorArticle(req,res) {
  const b=req.body||{}; const title=String(b.title||'').trim(), content=String(b.content||''); const categoryId=assertId(b.categoryId);
  if(title.length<3||title.length>255) throw new ApiError(400,'VALIDATION_ERROR','Tiêu đề phải có từ 3 đến 255 ký tự.');
  const [[cat]]=await q("SELECT id FROM categories WHERE id=? AND status='ACTIVE'",[categoryId]); if(!cat) throw new ApiError(400,'CATEGORY_NOT_FOUND','Danh mục không tồn tại hoặc đang ẩn.');
  const requested=String(b.status||'DRAFT').toUpperCase(); if(!['DRAFT','PENDING'].includes(requested)) throw new ApiError(400,'INVALID_ARTICLE_STATUS','Khi tạo bài chỉ được chọn DRAFT hoặc PENDING.');
  if(requested==='PENDING' && !content.trim()) throw new ApiError(400,'ARTICLE_CONTENT_REQUIRED','Bài viết cần nội dung trước khi gửi duyệt.');
  const slugBase=toSlug(b.slug||title)||`article-${Date.now()}`; let slug=slugBase, suffix=1; while(true){const [[exists]]=await q('SELECT id FROM articles WHERE slug=? LIMIT 1',[slug]); if(!exists) break; slug=`${slugBase}-${++suffix}`;}
  const [r]=await q('INSERT INTO articles (slug,title,excerpt,content,cover_image,category_id,author_id,status,reading_time) VALUES (?,?,?,?,?,?,?,?,?)',[slug,title,b.excerpt||null,content,b.coverImage||null,categoryId,req.user.id,requested,Math.max(1,Math.ceil(content.replace(/<[^>]*>/g,' ').split(/\s+/).filter(Boolean).length/220))]);
  await audit(req,requested==='PENDING'?'Gửi bài viết chờ duyệt':'Tạo bản nháp bài viết','articles',r.insertId);
  return sendCreated(res,{id:r.insertId,slug,title,status:requested});
}
export async function getAuthorArticleEdit(req,res) { const id=assertId(req.params.id); const a=await getOwnedArticle(req,id); const [tags]=await q('SELECT t.id,t.name,t.slug FROM tags t JOIN article_tags at ON at.tag_id=t.id WHERE at.article_id=?',[id]); return sendSuccess(res,{...a,coverImage:a.cover_image,categoryId:a.category_id,authorId:a.author_id,scheduledAt:a.scheduled_at,tags}); }
export async function updateAuthorArticle(req,res) {
  const id=assertId(req.params.id); const a=await getOwnedArticle(req,id); if(!['DRAFT','REJECTED','PENDING'].includes(a.status) && !['ADMIN','EDITOR'].includes(req.user.role)) throw new ApiError(409,'ARTICLE_NOT_EDITABLE','Bài viết ở trạng thái này không thể sửa.');
  const b=parseBody(req.body,['title','excerpt','content','coverImage','categoryId','slug']); if(!Object.keys(b).length) throw new ApiError(400,'VALIDATION_ERROR','Không có dữ liệu cập nhật.');
  if(b.title!==undefined && (typeof b.title!=='string'||b.title.trim().length<3||b.title.trim().length>255)) throw new ApiError(400,'VALIDATION_ERROR','Tiêu đề phải có từ 3 đến 255 ký tự.');
  if(b.categoryId!==undefined){const [[c]]=await q("SELECT id FROM categories WHERE id=? AND status='ACTIVE'",[assertId(b.categoryId)]); if(!c) throw new ApiError(400,'CATEGORY_NOT_FOUND','Danh mục không hợp lệ.');}
  const col={title:'title',excerpt:'excerpt',content:'content',coverImage:'cover_image',categoryId:'category_id',slug:'slug'}; const sets=[],vals=[]; for(const [k,v] of Object.entries(b)){sets.push(`${col[k]}=?`);vals.push(k==='title'?v.trim():v);}
  sets.push("status='DRAFT'",'reject_reason=NULL'); await q(`UPDATE articles SET ${sets.join(',')} WHERE id=?`,[...vals,id]);
  await audit(req,'Cập nhật bài viết','articles',id); return sendSuccess(res,{id,status:'DRAFT',message:'Đã lưu bài viết.'});
}
export async function deleteAuthorArticle(req,res) { const id=assertId(req.params.id); const a=await getOwnedArticle(req,id); if(!['DRAFT','REJECTED','UNPUBLISHED'].includes(a.status)&&!['ADMIN','EDITOR'].includes(req.user.role)) throw new ApiError(409,'ARTICLE_NOT_DELETABLE','Chỉ được xóa bài nháp, bị từ chối hoặc chưa xuất bản.'); await q('UPDATE articles SET deleted_at=NOW() WHERE id=?',[id]); await audit(req,'Xóa mềm bài viết','articles',id); return sendSuccess(res,{id,message:'Đã xóa bài viết.'}); }
export async function submitAuthorArticle(req,res) { const id=assertId(req.params.id); const a=await getOwnedArticle(req,id); if(!['DRAFT','REJECTED'].includes(a.status)) throw new ApiError(409,'INVALID_ARTICLE_STATUS','Chỉ bài DRAFT hoặc REJECTED mới được gửi duyệt.'); if(!a.content?.trim()) throw new ApiError(400,'ARTICLE_CONTENT_REQUIRED','Bài viết cần nội dung trước khi gửi duyệt.'); await q("UPDATE articles SET status='PENDING',reject_reason=NULL WHERE id=?",[id]); await audit(req,'Gửi bài viết duyệt','articles',id); return sendSuccess(res,{id,status:'PENDING'}); }
export async function getAuthorSchedule(req,res) { const [items]=await q("SELECT a.id,a.title,c.name AS category,a.scheduled_at AS scheduledAt,a.status FROM articles a JOIN categories c ON c.id=a.category_id WHERE a.author_id=? AND a.deleted_at IS NULL AND a.status='SCHEDULED' ORDER BY a.scheduled_at ASC",[req.user.id]); return sendSuccess(res,{items}); }
export async function scheduleAuthorArticle(req,res) { const id=assertId(req.params.id); const a=await getOwnedArticle(req,id); const d=new Date(req.body?.scheduledAt); if(!req.body?.scheduledAt||Number.isNaN(d.getTime())||d.getTime()<=Date.now()) throw new ApiError(400,'INVALID_SCHEDULE_TIME','scheduledAt phải là thời điểm hợp lệ trong tương lai.'); if(!['DRAFT','REJECTED','PUBLISHED','SCHEDULED','UNPUBLISHED'].includes(a.status)) throw new ApiError(409,'INVALID_ARTICLE_STATUS','Trạng thái bài viết không cho phép lên lịch.'); await q("UPDATE articles SET scheduled_at=?,status='SCHEDULED' WHERE id=?",[d,id]); await audit(req,'Lên lịch xuất bản bài viết','articles',id); return sendSuccess(res,{id,scheduledAt:d.toISOString(),status:'SCHEDULED'}); }
export async function getAuthorAnalytics(req,res) { const range=String(req.query.range||'7d'); if(!['7d','30d'].includes(range)) throw new ApiError(400,'VALIDATION_ERROR','range chỉ nhận 7d hoặc 30d.'); const days=range==='30d'?30:7; const [[totals]]=await q(`SELECT COALESCE(SUM(views),0) views,COALESCE(SUM(likes),0) likes,COALESCE(SUM(comments),0) comments,COALESCE(SUM(bookmarks),0) bookmarks FROM article_stats_daily WHERE article_id IN (SELECT id FROM articles WHERE author_id=? AND deleted_at IS NULL) AND stat_date>=DATE_SUB(CURDATE(), INTERVAL ? DAY)`,[req.user.id,days]); const [chart]=await q(`SELECT stat_date AS day,SUM(views) views,SUM(likes) likes,SUM(comments) comments FROM article_stats_daily WHERE article_id IN (SELECT id FROM articles WHERE author_id=? AND deleted_at IS NULL) AND stat_date>=DATE_SUB(CURDATE(), INTERVAL ? DAY) GROUP BY stat_date ORDER BY stat_date`,[req.user.id,days]); const [topArticles]=await q('SELECT id,title,views,likes_count AS likes,comments_count AS comments FROM articles WHERE author_id=? AND deleted_at IS NULL ORDER BY views DESC LIMIT 10',[req.user.id]); return sendSuccess(res,{totals,chart,topArticles,range}); }

// ---------------- MEDIA ----------------
export async function listMedia(req,res) { const {page,limit}=pageInfo(req),offset=(page-1)*limit; const isAdmin=['ADMIN','EDITOR'].includes(req.user.role); const where=isAdmin?'':'WHERE uploader_id=?'; const args=isAdmin?[]:[req.user.id]; const [[c]]=await q(`SELECT COUNT(*) total FROM media ${where}`,args); const [rows]=await q(`SELECT id,filename,original_name AS name,url,mime_type AS mimeType,size_bytes AS sizeBytes,created_at AS createdAt FROM media ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,[...args,limit,offset]); return sendPaginated(res,{items:rows.map(x=>({...x,size:formatBytes(x.sizeBytes)}))},{page,limit,totalItems:c.total,totalPages:Math.ceil(c.total/limit)}); }
function formatBytes(n){if(n<1024)return `${n} B`; if(n<1024*1024)return `${(n/1024).toFixed(1)} KB`; return `${(n/(1024*1024)).toFixed(1)} MB`;}
export async function uploadMedia(req,res) { if(!req.file) throw new ApiError(400,'FILE_REQUIRED','Vui lòng chọn file.'); const url=`${(process.env.PUBLIC_BASE_URL||'').replace(/\/$/,'')}/Uploads/${req.file.filename}`; const [r]=await q('INSERT INTO media (uploader_id,filename,original_name,url,mime_type,size_bytes) VALUES (?,?,?,?,?,?)',[req.user.id,req.file.filename,req.file.originalname,url,req.file.mimetype,req.file.size]); return sendCreated(res,{id:r.insertId,name:req.file.originalname,size:formatBytes(req.file.size),url,mimeType:req.file.mimetype}); }
export async function deleteMedia(req,res) { const id=assertId(req.params.id); const [[m]]=await q('SELECT * FROM media WHERE id=?',[id]); if(!m) throw new ApiError(404,'MEDIA_NOT_FOUND','Không tìm thấy file.'); if(Number(m.uploader_id)!==Number(req.user.id)&&req.user.role!=='ADMIN') throw new ApiError(403,'FORBIDDEN','Bạn không có quyền xóa file này.'); await q('DELETE FROM media WHERE id=?',[id]); try { await fs.unlink(path.join(process.cwd(),'src','uploads',m.filename)); } catch(e) { if(e.code!=='ENOENT') req.log?.warn({err:e},'Unable to delete media file from disk'); } return sendSuccess(res,{message:'Đã xóa file.'}); }

// ---------------- ADMIN DASHBOARD / USERS / TAGS / MENU / RBAC / ADS / LOGS / SETTINGS ----------------
export async function adminDashboard(req,res) { const [[articles]]=await q("SELECT COUNT(*) total,SUM(status='PUBLISHED') published,SUM(status='PENDING') pending FROM articles WHERE deleted_at IS NULL"); const [[users]]=await q("SELECT COUNT(*) total,SUM(status='ACTIVE') active,SUM(status='BLOCKED') blocked FROM users"); const [[comments]]=await q("SELECT COUNT(*) total FROM comments WHERE status='VISIBLE'"); const [[reports]]=await q("SELECT COUNT(*) total FROM comment_reports WHERE status='PENDING'"); const [daily]=await q('SELECT stat_date AS day,SUM(views) views,SUM(likes) likes FROM article_stats_daily WHERE stat_date>=DATE_SUB(CURDATE(),INTERVAL 7 DAY) GROUP BY stat_date ORDER BY stat_date'); return sendSuccess(res,{articles,users,comments:comments.total,pendingReports:reports.total,daily}); }
export async function adminUsers(req,res) { const {page,limit}=pageInfo(req),offset=(page-1)*limit; const search=String(req.query.search||'').trim(); const role=String(req.query.role||'').toUpperCase(); const status=String(req.query.status||'').toUpperCase(); const where=[],args=[]; if(search){where.push('(u.name LIKE ? OR u.email LIKE ?)');args.push(`%${search}%`,`%${search}%`);} if(role){if(!['ADMIN','EDITOR','AUTHOR','SUBSCRIBER'].includes(role))throw new ApiError(400,'VALIDATION_ERROR','role không hợp lệ.');where.push('r.code=?');args.push(role);} if(status){if(!['ACTIVE','BLOCKED'].includes(status))throw new ApiError(400,'VALIDATION_ERROR','status không hợp lệ.');where.push('u.status=?');args.push(status);} const clause=where.length?`WHERE ${where.join(' AND ')}`:''; const [[c]]=await q(`SELECT COUNT(*) total FROM users u JOIN roles r ON r.id=u.role_id ${clause}`,args); const [items]=await q(`SELECT u.id,u.name,u.email,r.code AS role,u.status,u.created_at AS createdAt,u.last_login_at AS lastLoginAt FROM users u JOIN roles r ON r.id=u.role_id ${clause} ORDER BY u.created_at DESC LIMIT ? OFFSET ?`,[...args,limit,offset]); return sendPaginated(res,{items},{page,limit,totalItems:c.total,totalPages:Math.ceil(c.total/limit)}); }
export async function adminSetUserStatus(req,res) { const id=assertId(req.params.id),status=String(req.body?.status||'').toUpperCase(); if(id===Number(req.user.id)) throw new ApiError(400,'CANNOT_CHANGE_SELF','Không thể thay đổi trạng thái tài khoản của chính mình.'); if(!['ACTIVE','BLOCKED'].includes(status)) throw new ApiError(400,'VALIDATION_ERROR','status chỉ nhận ACTIVE hoặc BLOCKED.'); const [[existing]]=await q('SELECT id FROM users WHERE id=?',[id]); if(!existing) throw new ApiError(404,'USER_NOT_FOUND','Không tìm thấy người dùng.'); await q('UPDATE users SET status=? WHERE id=?',[status,id]); if(status==='BLOCKED') await q('UPDATE refresh_tokens SET revoked=1 WHERE user_id=?',[id]); await audit(req,`Đổi trạng thái người dùng thành ${status}`,'users',id); return sendSuccess(res,{id,status}); }
export async function adminSetUserRole(req,res) { const id=assertId(req.params.id),role=String(req.body?.role||'').toUpperCase(); if(id===Number(req.user.id)) throw new ApiError(400,'CANNOT_CHANGE_SELF_ROLE','Không thể đổi vai trò của chính mình.'); const [[r]]=await q('SELECT id FROM roles WHERE code=?',[role]); if(!r) throw new ApiError(400,'INVALID_ROLE','Vai trò không tồn tại.'); const [u]=await q('UPDATE users SET role_id=? WHERE id=?',[r.id,id]); if(!u.affectedRows){const [[exists]]=await q('SELECT id FROM users WHERE id=?',[id]);if(!exists)throw new ApiError(404,'USER_NOT_FOUND','Không tìm thấy người dùng.');} await audit(req,`Đổi vai trò người dùng thành ${role}`,'users',id); return sendSuccess(res,{id,role}); }
export async function adminListTags(req,res) { const {page,limit}=pageInfo(req),offset=(page-1)*limit; const search=String(req.query.search||'').trim(); const where=search?'WHERE t.name LIKE ? OR t.slug LIKE ?':''; const args=search?[`%${search}%`,`%${search}%`]:[]; const [[c]]=await q(`SELECT COUNT(*) total FROM tags t ${where}`,args); const [items]=await q(`SELECT t.id,t.name,t.slug,COUNT(at.article_id) articleCount FROM tags t LEFT JOIN article_tags at ON at.tag_id=t.id ${where} GROUP BY t.id ORDER BY t.name LIMIT ? OFFSET ?`,[...args,limit,offset]); return sendPaginated(res,{items},{page,limit,totalItems:c.total,totalPages:Math.ceil(c.total/limit)}); }
export async function adminCreateTag(req,res) { const name=String(req.body?.name||'').trim(); if(!name||name.length>80) throw new ApiError(400,'VALIDATION_ERROR','name bắt buộc và tối đa 80 ký tự.'); const slug=toSlug(req.body?.slug||name).slice(0,100); if(!slug) throw new ApiError(400,'VALIDATION_ERROR','slug không hợp lệ.'); try { const [r]=await q('INSERT INTO tags (name,slug) VALUES (?,?)',[name,slug]); await audit(req,'Tạo tag','tags',r.insertId); return sendCreated(res,{item:{id:r.insertId,name,slug,articleCount:0}}); } catch(e) { if(e.code==='ER_DUP_ENTRY') throw new ApiError(409,'TAG_SLUG_EXISTS','Tên hoặc slug tag đã tồn tại.'); throw e; } }
export async function adminDeleteTag(req,res) { const id=assertId(req.params.id); const [[tag]]=await q('SELECT id FROM tags WHERE id=?',[id]); if(!tag) throw new ApiError(404,'TAG_NOT_FOUND','Không tìm thấy tag.'); const conn=await pool.getConnection(); try { await conn.beginTransaction(); await conn.execute('DELETE FROM article_tags WHERE tag_id=?',[id]); await conn.execute('DELETE FROM tags WHERE id=?',[id]); await conn.commit(); } catch(e){await conn.rollback();throw e;} finally{conn.release();} await audit(req,'Xóa tag','tags',id); return sendSuccess(res,{message:'Đã xóa tag và liên kết bài viết.',id}); }
export async function adminListMenu(req,res) { const loc=String(req.query.location||'').toUpperCase(); if(loc&&!['HEADER','FOOTER'].includes(loc))throw new ApiError(400,'VALIDATION_ERROR','location chỉ nhận HEADER hoặc FOOTER.'); const [items]=await q(`SELECT id,label,url,target,location,position,status FROM menu_items ${loc?'WHERE location=?':''} ORDER BY location,position,id`,loc?[loc]:[]); return sendSuccess(res,{items}); }
export async function adminCreateMenu(req,res) { const b=req.body||{},label=String(b.label||'').trim(),url=String(b.url||'').trim(),target=b.target||'_self',location=b.location||'HEADER'; if(!label||label.length>80||!url||url.length>255||!['_self','_blank'].includes(target)||!['HEADER','FOOTER'].includes(location))throw new ApiError(400,'VALIDATION_ERROR','Dữ liệu menu không hợp lệ.'); const [[p]]=await q('SELECT COALESCE(MAX(position),0)+1 AS nextPosition FROM menu_items WHERE location=?',[location]); const [r]=await q('INSERT INTO menu_items (label,url,target,location,position,status) VALUES (?,?,?,?,?,\'ACTIVE\')',[label,url,target,location,p.nextPosition]); return sendCreated(res,{item:{id:r.insertId,label,url,target,location,position:p.nextPosition,status:'ACTIVE'}}); }
export async function adminUpdateMenu(req,res) { const id=assertId(req.params.id),b=parseBody(req.body,['label','url','target','location','position','status']); const cols={label:'label',url:'url',target:'target',location:'location',position:'position',status:'status'}; if(!Object.keys(b).length)throw new ApiError(400,'VALIDATION_ERROR','Không có trường cần cập nhật.'); for(const [k,v] of Object.entries(b)){if(k==='label'&&(!String(v).trim()||String(v).length>80))throw new ApiError(400,'VALIDATION_ERROR','label không hợp lệ.');if(k==='target'&&!['_self','_blank'].includes(v))throw new ApiError(400,'VALIDATION_ERROR','target không hợp lệ.');if(k==='location'&&!['HEADER','FOOTER'].includes(v))throw new ApiError(400,'VALIDATION_ERROR','location không hợp lệ.');if(k==='status'&&!['ACTIVE','HIDDEN'].includes(v))throw new ApiError(400,'VALIDATION_ERROR','status không hợp lệ.');} const sets=Object.keys(b).map(k=>`${cols[k]}=?`); const [r]=await q(`UPDATE menu_items SET ${sets.join(',')} WHERE id=?`,[...Object.values(b),id]); const [[item]]=await q('SELECT id,label,url,target,location,position,status FROM menu_items WHERE id=?',[id]); if(!item)throw new ApiError(404,'MENU_NOT_FOUND','Không tìm thấy menu item.'); return sendSuccess(res,{item}); }
export async function adminDeleteMenu(req,res) { const id=assertId(req.params.id); const [r]=await q('DELETE FROM menu_items WHERE id=?',[id]); if(!r.affectedRows)throw new ApiError(404,'MENU_NOT_FOUND','Không tìm thấy menu item.'); return sendSuccess(res,{message:'Đã xóa liên kết.'}); }
export async function adminReorderMenu(req,res) { const ids=req.body?.ids; if(!Array.isArray(ids)||ids.some(x=>!Number.isInteger(Number(x))||Number(x)<1)||new Set(ids.map(Number)).size!==ids.length)throw new ApiError(400,'VALIDATION_ERROR','ids phải là danh sách ID duy nhất.'); const conn=await pool.getConnection(); try { await conn.beginTransaction(); for(let i=0;i<ids.length;i++){const [r]=await conn.execute('UPDATE menu_items SET position=? WHERE id=?',[i+1,Number(ids[i])]);if(!r.affectedRows)throw new ApiError(400,'MENU_ITEM_NOT_FOUND',`Không tìm thấy menu item ${ids[i]}.`);} await conn.commit(); }catch(e){await conn.rollback();throw e;}finally{conn.release();} const [items]=await q('SELECT id,label,url,target,location,position,status FROM menu_items ORDER BY location,position'); return sendSuccess(res,{items}); }
export async function adminRoles(req,res) { const [permissions]=await q('SELECT key_name AS `key`,label FROM permissions ORDER BY id'); const [roles]=await q('SELECT id,code,name,description FROM roles ORDER BY id'); for(const r of roles){const [ps]=await q('SELECT p.key_name FROM permissions p JOIN role_permissions rp ON rp.permission_id=p.id WHERE rp.role_id=? ORDER BY p.id',[r.id]);r.permissions=ps.map(x=>x.key_name);} return sendSuccess(res,{permissions,roles:roles.map(({id,...r})=>r)}); }
export async function adminUpdateRolePermissions(req,res) { const code=String(req.params.code||'').toUpperCase(),permissions=req.body?.permissions; if(!Array.isArray(permissions)||permissions.some(x=>typeof x!=='string'))throw new ApiError(400,'VALIDATION_ERROR','permissions phải là mảng các key.'); const [[role]]=await q('SELECT id,code FROM roles WHERE code=?',[code]); if(!role)throw new ApiError(404,'ROLE_NOT_FOUND','Không tìm thấy vai trò.'); const [all]=await q('SELECT id,key_name FROM permissions'); const valid=new Map(all.map(x=>[x.key_name,x.id])); if(permissions.some(p=>!valid.has(p)))throw new ApiError(400,'UNKNOWN_PERMISSION','Có quyền không tồn tại.'); if(code==='ADMIN'&&(new Set(permissions).size!==all.length||all.some(p=>!permissions.includes(p.key_name))))throw new ApiError(400,'ADMIN_PERMISSIONS_LOCKED','Vai trò ADMIN phải giữ toàn bộ quyền hệ thống.'); const conn=await pool.getConnection(); try{await conn.beginTransaction();await conn.execute('DELETE FROM role_permissions WHERE role_id=?',[role.id]);for(const p of new Set(permissions))await conn.execute('INSERT INTO role_permissions (role_id,permission_id) VALUES (?,?)',[role.id,valid.get(p)]);await conn.commit();}catch(e){await conn.rollback();throw e;}finally{conn.release();} await audit(req,`Cập nhật quyền vai trò ${code}`,'roles',code); return sendSuccess(res,{code,permissions:[...new Set(permissions)]}); }
export async function adminListAds(req,res) { const [items]=await q('SELECT id,title,position,image_url AS imageUrl,link_url AS linkUrl,is_active AS isActive,views,clicks,created_at AS createdAt FROM advertisements ORDER BY created_at DESC'); const [[s]]=await q('SELECT COUNT(*) total,SUM(is_active=1) activeAds,COALESCE(SUM(views),0) totalViews,COALESCE(SUM(clicks),0) totalClicks FROM advertisements'); return sendSuccess(res,{items,stats:{...s,ctr:s.totalViews?`${(s.totalClicks/s.totalViews*100).toFixed(1)}%`:'0.0%'}}); }
export async function adminCreateAd(req,res) { const b=req.body||{},title=String(b.title||'').trim(),position=String(b.position||'').toUpperCase(); if(!title||title.length>150||!['SIDEBAR','TOP_HOMEPAGE','IN_ARTICLE'].includes(position))throw new ApiError(400,'VALIDATION_ERROR','title hoặc position không hợp lệ.'); const [r]=await q('INSERT INTO advertisements (title,position,image_url,link_url,is_active) VALUES (?,?,?,?,1)',[title,position,b.imageUrl||null,b.linkUrl||null]); await audit(req,'Tạo quảng cáo','advertisements',r.insertId); return sendCreated(res,{item:{id:r.insertId,title,position,imageUrl:b.imageUrl||null,linkUrl:b.linkUrl||null,isActive:true,views:0,clicks:0}}); }
export async function adminUpdateAd(req,res) { const id=assertId(req.params.id),b=parseBody(req.body,['title','position','imageUrl','linkUrl','isActive']); if(!Object.keys(b).length)throw new ApiError(400,'VALIDATION_ERROR','Không có trường cập nhật.'); const cols={title:'title',position:'position',imageUrl:'image_url',linkUrl:'link_url',isActive:'is_active'}; const vals=[]; const sets=[]; for(const [k,v] of Object.entries(b)){if(k==='position'&&!['SIDEBAR','TOP_HOMEPAGE','IN_ARTICLE'].includes(v))throw new ApiError(400,'VALIDATION_ERROR','position không hợp lệ.');if(k==='isActive'&&typeof v!=='boolean')throw new ApiError(400,'VALIDATION_ERROR','isActive phải là boolean.');sets.push(`${cols[k]}=?`);vals.push(k==='isActive'?(v?1:0):v);} const [r]=await q(`UPDATE advertisements SET ${sets.join(',')} WHERE id=?`,[...vals,id]); const [[item]]=await q('SELECT id,title,position,image_url AS imageUrl,link_url AS linkUrl,is_active AS isActive,views,clicks FROM advertisements WHERE id=?',[id]); if(!item)throw new ApiError(404,'ADVERTISEMENT_NOT_FOUND','Không tìm thấy quảng cáo.'); return sendSuccess(res,{item}); }
export async function adminDeleteAd(req,res) { const id=assertId(req.params.id); const [r]=await q('DELETE FROM advertisements WHERE id=?',[id]); if(!r.affectedRows)throw new ApiError(404,'ADVERTISEMENT_NOT_FOUND','Không tìm thấy quảng cáo.'); await audit(req,'Xóa quảng cáo','advertisements',id); return sendSuccess(res,{message:'Đã xóa quảng cáo.'}); }
export async function recordAdEvent(req,res) { const id=assertId(req.params.id),type=String(req.body?.type||'').toUpperCase(); if(!['VIEW','CLICK'].includes(type))throw new ApiError(400,'VALIDATION_ERROR','type chỉ nhận VIEW hoặc CLICK.'); const conn=await pool.getConnection(); try{await conn.beginTransaction();const [r]=await conn.execute('SELECT id FROM advertisements WHERE id=? AND is_active=1 FOR UPDATE',[id]);if(!r.length)throw new ApiError(404,'ADVERTISEMENT_NOT_FOUND','Quảng cáo không tồn tại hoặc đang tắt.');await conn.execute('INSERT INTO ad_events (ad_id,type) VALUES (?,?)',[id,type]);await conn.execute(`UPDATE advertisements SET ${type==='VIEW'?'views=views+1':'clicks=clicks+1'} WHERE id=?`,[id]);const [[counts]]=await conn.execute('SELECT views,clicks FROM advertisements WHERE id=?',[id]);await conn.commit();return sendSuccess(res,counts);}catch(e){await conn.rollback();throw e;}finally{conn.release();} }
export async function adminAuditLogs(req,res) { const {page,limit}=pageInfo(req),offset=(page-1)*limit; const where=[],args=[]; const user=String(req.query.user||'').trim(),status=String(req.query.status||'').toUpperCase(),from=String(req.query.from||''),to=String(req.query.to||''); if(user){where.push('(user_label LIKE ? OR CAST(user_id AS CHAR)=?)');args.push(`%${user}%`,user);} if(status){if(!['SUCCESS','WARNING','FAILED'].includes(status))throw new ApiError(400,'VALIDATION_ERROR','status không hợp lệ.');where.push('status=?');args.push(status);} if(from){where.push('created_at>=?');args.push(`${from} 00:00:00`);} if(to){where.push('created_at<=?');args.push(`${to} 23:59:59`);} const clause=where.length?`WHERE ${where.join(' AND ')}`:''; const [[c]]=await q(`SELECT COUNT(*) total FROM audit_logs ${clause}`,args); const [items]=await q(`SELECT id,user_label AS user,action,entity,entity_id AS entityId,ip,status,created_at AS time FROM audit_logs ${clause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,[...args,limit,offset]); return sendPaginated(res,{items},{page,limit,totalItems:c.total,totalPages:Math.ceil(c.total/limit)}); }
async function readSettings(scope) { const [rows]=scope ? await q('SELECT `key`,value FROM settings WHERE scope=?',[scope]) : await q('SELECT `key`,value FROM settings'); const obj={}; for(const r of rows){let v=r.value;if(v==='true')v=true;else if(v==='false')v=false;else if(v!==null&&v!==''&&!Number.isNaN(Number(v))&&/^\d+(\.\d+)?$/.test(v))v=Number(v);obj[r.key]=v;} return obj; }
export async function adminGetSettings(req,res) { return sendSuccess(res,await readSettings(null)); }
export async function adminPutSettings(req,res) { const entries=Object.entries(req.body||{}); if(!entries.length)throw new ApiError(400,'VALIDATION_ERROR','Cần ít nhất một setting.'); const conn=await pool.getConnection(); try{await conn.beginTransaction();for(const [key,value] of entries){if(!/^[a-z][a-z0-9_]{1,63}$/.test(key))throw new ApiError(400,'INVALID_SETTING_KEY',`Key không hợp lệ: ${key}`);const serialized=typeof value==='object'&&value!==null?JSON.stringify(value):String(value);const publicKeys=new Set(['site_name','site_description','contact_email','contact_address','contact_hotline','maintenance_mode','enable_register']); const scope=publicKeys.has(key)?'PUBLIC':'ADMIN'; await conn.execute('INSERT INTO settings (`key`,value,scope) VALUES (?,?,?) ON DUPLICATE KEY UPDATE value=VALUES(value),scope=VALUES(scope)',[key,serialized,scope]);}await conn.commit();}catch(e){await conn.rollback();throw e;}finally{conn.release();} await audit(req,'Cập nhật cài đặt hệ thống','settings',null); return sendSuccess(res,await readSettings(null)); }

// ---------------- PUBLIC SYSTEM / CONTACT / HEALTH ----------------
export async function getPublicSettings(req,res) { const s=await readSettings('PUBLIC'); const bool=(v,def=false)=>v===undefined?def:boolValue(v); return sendSuccess(res,{siteName:s.site_name||'Portal News',siteDescription:s.site_description||'',contactEmail:s.contact_email||'',contactAddress:s.contact_address||'',contactHotline:s.contact_hotline||'',maintenanceMode:bool(s.maintenance_mode),enableRegister:bool(s.enable_register,true)}); }
export async function getPublicMenu(req,res) { const location=String(req.query.location||'HEADER').toUpperCase(); if(!['HEADER','FOOTER'].includes(location))throw new ApiError(400,'VALIDATION_ERROR','location chỉ nhận HEADER hoặc FOOTER.'); const [items]=await q("SELECT id,label,url,target FROM menu_items WHERE location=? AND status='ACTIVE' ORDER BY position,id",[location]); return sendSuccess(res,{items}); }
export async function submitContact(req,res) { const b=req.body||{},name=String(b.name||'').trim(),email=String(b.email||'').trim(),subject=String(b.subject||'').trim(),content=String(b.content||'').trim(); if(!name||name.length>100||!/^\S+@\S+\.\S+$/.test(email)||email.length>190||!subject||subject.length>200||!content||content.length>10000)throw new ApiError(400,'VALIDATION_ERROR','Vui lòng nhập tên, email hợp lệ, tiêu đề và nội dung (tối đa 10000 ký tự).'); const [r]=await q('INSERT INTO contact_messages (name,email,subject,content) VALUES (?,?,?,?)',[name,email,subject,content]); return sendCreated(res,{id:r.insertId,message:'Đã gửi tin nhắn thành công!'}); }
export async function systemHealth(req,res) { let db='connected'; try{await q('SELECT 1');}catch{db='disconnected';} const status=db==='connected'?'ok':'degraded'; return res.status(db==='connected'?200:503).json({success:db==='connected',data:{status,uptime:Math.floor(process.uptime()),db}}); }

export async function getAdminCategoryTree(req,res) {
  const [rows]=await q("SELECT id,name,slug,parent_id AS parentId,description,position,status FROM categories ORDER BY position,name");
  const byId=new Map(rows.map(x=>[Number(x.id),{...x,children:[]}])); const roots=[];
  for(const item of byId.values()){if(item.parentId&&byId.has(Number(item.parentId)))byId.get(Number(item.parentId)).children.push(item);else roots.push(item);}
  return sendSuccess(res,{items:roots});
}
export async function getAuthorDashboard(req,res) {
  const id=req.user.id;
  const [[counts]]=await q("SELECT COUNT(*) total,SUM(status='DRAFT') drafts,SUM(status='PENDING') pending,SUM(status='PUBLISHED') published,SUM(status='REJECTED') rejected,SUM(status='SCHEDULED') scheduled,COALESCE(SUM(views),0) views,COALESCE(SUM(likes_count),0) likes,COALESCE(SUM(comments_count),0) comments FROM articles WHERE author_id=? AND deleted_at IS NULL",[id]);
  const [recent]=await q('SELECT id,title,status,updated_at AS updatedAt,published_at AS publishedAt FROM articles WHERE author_id=? AND deleted_at IS NULL ORDER BY updated_at DESC LIMIT 8',[id]);
  return sendSuccess(res,{stats:counts,recent});
}
export async function getMyArticles(req,res) {
  const {page,limit}=pageInfo(req),offset=(page-1)*limit; const status=String(req.query.status||'').toUpperCase(); const search=String(req.query.search||'').trim(); const where=['author_id=?','deleted_at IS NULL'],args=[req.user.id];
  if(status){if(!['DRAFT','PENDING','PUBLISHED','REJECTED','SCHEDULED','UNPUBLISHED'].includes(status))throw new ApiError(400,'VALIDATION_ERROR','status không hợp lệ.');where.push('status=?');args.push(status);} if(search){where.push('title LIKE ?');args.push(`%${search}%`);} const clause=`WHERE ${where.join(' AND ')}`;
  const [[c]]=await q(`SELECT COUNT(*) total FROM articles ${clause}`,args); const [items]=await q(`SELECT id,slug,title,excerpt,cover_image AS coverImage,status,is_featured AS isFeatured,views,likes_count AS likesCount,comments_count AS commentsCount,reject_reason AS rejectReason,scheduled_at AS scheduledAt,published_at AS publishedAt,created_at AS createdAt,updated_at AS updatedAt FROM articles ${clause} ORDER BY updated_at DESC LIMIT ? OFFSET ?`,[...args,limit,offset]);
  return sendPaginated(res,{items},{page,limit,totalItems:c.total,totalPages:Math.ceil(c.total/limit)});
}
export async function recordArticleView(req,res) {
  const id=assertId(req.params.id); const [[a]]=await q("SELECT id,author_id FROM articles WHERE id=? AND status='PUBLISHED' AND deleted_at IS NULL",[id]); if(!a)throw new ApiError(404,'ARTICLE_NOT_FOUND','Không tìm thấy bài viết đã xuất bản.');
  await q('UPDATE articles SET views=views+1 WHERE id=?',[id]);
  await q('INSERT INTO article_stats_daily (article_id,stat_date,views) VALUES (?,CURDATE(),1) ON DUPLICATE KEY UPDATE views=views+1',[id]);
  if(req.user?.id) await q('INSERT INTO reading_history (user_id,article_id,read_at) VALUES (?,?,NOW()) ON DUPLICATE KEY UPDATE read_at=NOW()',[req.user.id,id]);
  return sendSuccess(res,{articleId:id,recorded:true});
}
