import { lazy, Suspense } from 'react';
import { Outlet, Navigate, useRoutes } from 'react-router-dom';

import DashboardLayout from 'src/layouts/dashboard';
import MemberPortalLayout from 'src/layouts/member-portal/layout';

export const IndexPage = lazy(() => import('src/pages/app'));
export const UserPage = lazy(() => import('src/pages/user'));
export const PlanPage = lazy(() => import('src/pages/plan'));
export const LoginPage = lazy(() => import('src/pages/login'));
export const EmailPage = lazy(() => import('src/pages/email'));
export const Page404 = lazy(() => import('src/pages/page-not-found'));
export const AccountPage = lazy(() => import('src/pages/my-account'));

export const UnifiedLoginPage = lazy(() => import('src/pages/unified-login'));
export const MemberLoginPage = lazy(() => import('src/pages/member-login'));
export const MemberRegisterPage = lazy(() => import('src/pages/member-register'));
export const MemberDashboardPage = lazy(() => import('src/pages/member-dashboard'));

// ----------------------------------------------------------------------

export default function Router() {
  const routes = useRoutes([
    {
      index: true,
      element: (
        <Suspense fallback={null}>
          <UnifiedLoginPage />
        </Suspense>
      ),
    },
    {
      path: 'member',
      element: <MemberPortalLayout />,
      children: [
        { path: 'login', element: <Navigate to="/" replace /> },
        { path: 'register', element: <MemberRegisterPage /> },
        { index: true, element: <MemberDashboardPage /> },
      ],
    },
    {
      path: 'admin',
      element: (
        <DashboardLayout>
          <Suspense>
            <Outlet />
          </Suspense>
        </DashboardLayout>
      ),
      children: [
        { element: <IndexPage />, index: true },
        { path: 'user', element: <UserPage /> },
        { path: 'plan', element: <PlanPage /> },
        { path: 'email', element: <EmailPage /> },
        { path: 'myAccount', element: <AccountPage /> },
      ],
    },
    {
      path: 'admin/login',
      element: <Navigate to="/" replace />,
    },
    {
      path: '404',
      element: <Page404 />,
    },
    {
      path: '*',
      element: <Navigate to="/404" replace />,
    },
  ]);

  return routes;
}
