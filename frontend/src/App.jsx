import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Can } from "@casl/react";
import ProtectedRoute from "@/routes/ProtectedRoute";

// ── Lazy loading: mỗi trang là 1 chunk riêng → bundle ban đầu nhỏ hơn ──
// Public Pages
const HomePage = lazy(() => import("@/pages/HomePage"));
const AllArticlesPage = lazy(() => import("@/pages/AllArticlesPage"));
const ArticleDetailPage = lazy(() => import("@/pages/ArticleDetailPage"));
const CategoryPage = lazy(() => import("@/pages/CategoryPage"));
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/RegisterPage"));
const ForgotPasswordPage = lazy(() => import("@/pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("@/pages/ResetPasswordPage"));
const SearchPage = lazy(() => import("@/pages/SearchPage"));
const AuthorPublicProfilePage = lazy(() => import("@/pages/AuthorPublicProfilePage"));
const TagPage = lazy(() => import("@/pages/TagPage"));
const AboutPage = lazy(() => import("@/pages/AboutPage"));
const ContactPage = lazy(() => import("@/pages/user/ContactPage"));

// User Pages
const BookmarksPage = lazy(() => import("@/pages/user/BookmarksPage"));
const ReadingHistoryPage = lazy(() => import("@/pages/user/ReadingHistoryPage"));
const NotificationsPage = lazy(() => import("@/pages/user/NotificationsPage"));
const ProfilePage = lazy(() => import("@/pages/user/ProfilePage"));

// Author Pages & Layout
const AuthorLayout = lazy(() => import("@/layouts/AuthorLayout"));
const AuthorDashboard = lazy(() => import("@/pages/author/AuthorDashboard"));
const CreateArticlePage = lazy(() => import("@/pages/author/CreateArticlePage"));
const MyArticlesPage = lazy(() => import("@/pages/author/MyArticlesPage"));
const EditArticlePage = lazy(() => import("@/pages/author/EditArticlePage"));
const MediaLibraryPage = lazy(() => import("@/pages/author/MediaLibraryPage"));
const PublishSchedulePage = lazy(() => import("@/pages/author/PublishSchedulePage"));
const ArticleAnalyticsPage = lazy(() => import("@/pages/author/ArticleAnalyticsPage"));

// Admin Pages & Layout
const AdminLayout = lazy(() => import("@/layouts/AdminLayout"));
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const ArticleModerationPage = lazy(() => import("@/pages/admin/ArticleModerationPage"));
const CommentReportsPage = lazy(() => import("@/pages/admin/CommentReportsPage"));
const UserManagementPage = lazy(() => import("@/pages/admin/UserManagementPage"));
const CategoryTagManagementPage = lazy(() => import("@/pages/admin/CategoryTagManagementPage"));
const AdsManagementPage = lazy(() => import("@/pages/admin/AdsManagementPage"));
const AuditLogPage = lazy(() => import("@/pages/admin/AuditLogPage"));
const MenuManagementPage = lazy(() => import("@/pages/admin/MenuManagementPage"));
const RolePermissionsPage = lazy(() => import("@/pages/admin/RolePermissionsPage"));
const SystemSettingsPage = lazy(() => import("@/pages/admin/SystemSettingsPage"));

// System Pages
const ForbiddenPage = lazy(() => import("@/pages/system/ForbiddenPage"));
const MaintenancePage = lazy(() => import("@/pages/system/MaintenancePage"));
const NotFoundPage = lazy(() => import("@/pages/system/NotFoundPage"));

// Fallback chung khi tải chunk trang
function RouteFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/articles" element={<AllArticlesPage />} />
      <Route path="/article/:id" element={<ArticleDetailPage />} />
      <Route path="/category/:slug" element={<CategoryPage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/tag/:slug" element={<TagPage />} />
      <Route path="/author-profile/:id" element={<AuthorPublicProfilePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />

      {/* Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* User Routes (Protected) */}
      <Route path="/user/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/user/bookmarks" element={<ProtectedRoute><BookmarksPage /></ProtectedRoute>} />
      <Route path="/user/history" element={<ProtectedRoute><ReadingHistoryPage /></ProtectedRoute>} />
      <Route path="/user/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />

      {/* Author Studio Routes — chỉ author/editor/admin */}
      <Route
        path="/author"
        element={
          <ProtectedRoute allowedRoles={["admin", "editor", "author"]}>
            <AuthorLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AuthorDashboard />} />
        <Route path="articles" element={<MyArticlesPage />} />
        <Route path="create" element={<CreateArticlePage />} />
        <Route path="edit/:id" element={<EditArticlePage />} />
        <Route path="analytics" element={<ArticleAnalyticsPage />} />
        <Route path="media" element={<MediaLibraryPage />} />
        <Route path="schedule" element={<PublishSchedulePage />} />
      </Route>

      {/* Admin Panel Routes — chỉ admin */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
  <Route index element={<Can do="access" on="AdminDashBoard" passThrough>
        {({ isAllowed }) =>
          isAllowed ? <AdminDashboard /> : <Navigate to="/403" replace />
        }
      </Can>} />

  <Route
    path="articles"
    element={
      <Can do="access" on="ArticleModerationPage" passThrough>
        {({ isAllowed }) =>
          isAllowed ? <ArticleModerationPage /> : <Navigate to="/403" replace />
        }
      </Can>
    }
  />

  <Route
    path="moderation"
    element={
      <Can do="access" on="ArticleModerationPage" passThrough>
        {({ isAllowed }) =>
          isAllowed ? <ArticleModerationPage /> : <Navigate to="/403" replace />
        }
      </Can>
    }
  />

  <Route
    path="categories"
    element={
      <Can do="access" on="CategoryTagManagementPage" passThrough>
        {({ isAllowed }) =>
          isAllowed ? <CategoryTagManagementPage /> : <Navigate to="/403" replace />
        }
      </Can>
    }
  />

  <Route
    path="menu"
    element={
      <Can do="access" on="MenuManagementPage" passThrough>
        {({ isAllowed }) =>
          isAllowed ? <MenuManagementPage /> : <Navigate to="/403" replace />
        }
      </Can>
    }
  />
        <Route path="comment-reports" element={<CommentReportsPage />} />
        <Route
          path="users"
          element={
            <Can do="access" on="UserManagementPage" passThrough>
              {({ isAllowed }) =>
                isAllowed ? <UserManagementPage /> : <Navigate to="/403" replace />
              }
            </Can>
          }
        />
        <Route
          path="roles"
          element={
            <Can do="access" on="RolePermissionsPage" passThrough>
              {({ isAllowed }) =>
                isAllowed ? <RolePermissionsPage /> : <Navigate to="/403" replace />
              }
            </Can>
          }
        />
        <Route
          path="ads"
          element={
            <Can do="access" on="AdsManagementPage" passThrough>
              {({ isAllowed }) =>
                isAllowed ? <AdsManagementPage /> : <Navigate to="/403" replace />
              }
            </Can>
          }
        />
        <Route
          path="logs"
          element={
            <Can do="access" on="AuditLogPage" passThrough>
              {({ isAllowed }) =>
                isAllowed ? <AuditLogPage /> : <Navigate to="/403" replace />
              }
            </Can>
          }
        />
        <Route
          path="system"
          element={
            <Can do="access" on="SystemSettingsPage" passThrough>
              {({ isAllowed }) =>
                isAllowed ? <SystemSettingsPage /> : <Navigate to="/403" replace />
              }
            </Can>
          }
        />
      </Route>
      {/* Trang lỗi hệ thống */}
      <Route path="/403" element={<ForbiddenPage />} />
      <Route path="/maintenance" element={<MaintenancePage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
    </Suspense>
  );
}