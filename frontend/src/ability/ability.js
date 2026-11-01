import {
  AbilityBuilder,
  createMongoAbility,
} from '@casl/ability';

// ── Danh sách trang CHỈ admin được truy cập (route-level) ──
// Khớp ma trận quyền docs/API.md §10: "Quản lý user/role/ads/logs/settings" chỉ ADMIN.
// Tên subject trùng với tên component trang tương ứng trong App.jsx.
export const ADMIN_ONLY_PAGES = [
'ArticleModerationPage',      // /admin/articles, /admin/moderation
  'CategoryTagManagementPage',  // /admin/categories
  'MenuManagementPage',         // /admin/menu
  'UserManagementPage',         // /admin/users
  'RolePermissionsPage',        // /admin/roles
  'AdsManagementPage',          // /admin/ads
  'AuditLogPage',                // /admin/logs
  'SystemSettingsPage',
  "AdminDashBoard"          // /admin/system
];

export function defineAbilityFor(user) {
  const { can, build } = new AbilityBuilder(createMongoAbility);

  // ── Công khai (kể cả khách vãng lai) ──
  can('read', 'Post');
  can('read', 'Comment');

  if (!user) return build();      // khách: chỉ đọc

  // ── Mọi user đã đăng nhập ──
  can('create', 'Comment');
  can('update', 'Comment', { authorId: user.id });   // chỉ comment của mình
  can('delete', 'Comment', { authorId: user.id });

  // ── EDITOR: kiểm duyệt mọi comment + CRUD Post ──
  if (user.role === 'editor') {
    can('delete', 'Comment');                         // xóa mọi comment
    can('read', 'Post'); can('create', 'Post');
    can('update', 'Post'); can('delete', 'Post');
  }

  // ── ADMIN ──
  if (user.role === 'admin') {
    can('manage', 'all');

    // Quyền truy cập ('access') các trang admin-only — router kiểm tra bằng <Can do="access" />
    ADMIN_ONLY_PAGES.forEach((page) => can('access', page));
  }

  // ── SUBSCRIBER/USER: đọc Post ──
  if (user.role === 'subscriber' || user.role === 'user') {
    can('read', 'Post');
  }

  return build();
}
