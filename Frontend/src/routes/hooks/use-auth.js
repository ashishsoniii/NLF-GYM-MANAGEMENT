import { useEffect } from 'react';

import { useRouter } from 'src/routes/hooks';

const useAuth = () => {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');

    // Check if token is available
    if (!token) {
      // Token not available, redirect to login page
      router.push('/login');
      return;
    }

    // Decode token to check if it's expired
    const decodedToken = decodeToken(token);
    if (!decodedToken || decodedToken.exp < Date.now() / 1000) {
      // Token expired, redirect to login page
      router.push('/login');
    }
  }, [router]);

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
