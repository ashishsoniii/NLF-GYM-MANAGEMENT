import { useEffect } from 'react';

import { useRouter, usePathname } from 'src/routes/hooks';

const useAuth = () => {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (pathname === '/login') {
      if (token) {
        const decoded = decodeToken(token);
        if (decoded && decoded.exp > Date.now() / 1000) {
          router.replace('/');
        }
      }
      return;
    }

    if (!token) {
      router.replace('/login');
      return;
    }

    const decodedToken = decodeToken(token);
    if (!decodedToken || decodedToken.exp < Date.now() / 1000) {
      router.replace('/login');
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
