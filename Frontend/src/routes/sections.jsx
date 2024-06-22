import { lazy, Suspense } from 'react';
import { Outlet, Navigate, useRoutes } from 'react-router-dom';

import DashboardLayout from 'src/layouts/dashboard';

export const IndexPage = lazy(() => import('src/pages/app'));
export const UserPage = lazy(() => import('src/pages/user'));
export const PlanPage = lazy(() => import('src/pages/plan'));
export const LoginPage = lazy(() => import('src/pages/login'));
export const EmailPage = lazy(() => import('src/pages/email'));
export const Page404 = lazy(() => import('src/pages/page-not-found'));
export const AccountPage = lazy(() => import('src/pages/my-account'));

// ----------------------------------------------------------------------

export default function Router() {
  const routes = useRoutes([
    {
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
      path: 'login',
      element: <LoginPage />,
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
