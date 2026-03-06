import { useEffect } from 'react';

import { useRouter } from 'src/routes/hooks/use-router';
import { usePathname } from 'src/routes/hooks/use-pathname';

const useMemberAuth = () => {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname.startsWith('/member')) return;

    const memberToken = localStorage.getItem('memberToken');
    const isLoginPage = pathname === '/member/login';
    const isRegisterPage = pathname === '/member/register';
    const isUnifiedLogin = pathname === '/';

    if (isLoginPage || isRegisterPage || isUnifiedLogin) {
      if (memberToken) {
        const decoded = decodeToken(memberToken);
        if (decoded && decoded.exp > Date.now() / 1000) {
          router.replace('/member');
        }
      }
      return;
    }

    if (!memberToken) {
      router.replace('/');
      return;
    }

    const decoded = decodeToken(memberToken);
    if (!decoded || decoded.exp < Date.now() / 1000) {
      localStorage.removeItem('memberToken');
      localStorage.removeItem('memberName');
      localStorage.removeItem('memberEmail');
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

export default useMemberAuth;
