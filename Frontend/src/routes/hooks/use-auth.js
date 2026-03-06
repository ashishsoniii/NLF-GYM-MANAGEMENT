import { useEffect } from 'react';

import { useRouter, usePathname } from 'src/routes/hooks';

const useAuth = () => {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Login page: if already logged in, redirect to admin or member dashboard
    if (pathname === '/') {
      const token = localStorage.getItem('token');
      const memberToken = localStorage.getItem('memberToken');
      const now = Date.now() / 1000;
      if (token) {
        const decoded = decodeToken(token);
        if (decoded && decoded.exp > now) {
          router.replace('/admin');
          return;
        }
      }
      if (memberToken) {
        const decoded = decodeToken(memberToken);
        if (decoded && decoded.exp > now) {
          router.replace('/member');
          return;
        }
      }
      return;
    }

    if (!pathname.startsWith('/admin')) return;

    const token = localStorage.getItem('token');

    if (pathname === '/admin/login') {
      if (token) {
        const decoded = decodeToken(token);
        if (decoded && decoded.exp > Date.now() / 1000) {
          router.replace('/admin');
        }
      }
      return;
    }

    if (!token) {
      router.replace('/');
      return;
    }

    const decodedToken = decodeToken(token);
    if (!decodedToken || decodedToken.exp < Date.now() / 1000) {
      router.replace('/');
    }
  }, [router, pathname]);

  return null;
};

const decodeToken = (token) => {
  try {
    const decoded = JSON.parse(atob(token.split('.')[1]));
    return decoded;
  } catch (error) {
    return null;
  }
};

export default useAuth;
