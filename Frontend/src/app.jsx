/* eslint-disable perfectionist/sort-imports */
import 'src/global.css';

import { useScrollToTop } from 'src/hooks/use-scroll-to-top';

import Router from 'src/routes/sections';
import ThemeProvider from 'src/theme';

import useAuth from './routes/hooks/use-auth';
import useMemberAuth from './routes/hooks/use-member-auth';

// ----------------------------------------------------------------------

export default function App() {
  useAuth();
  useMemberAuth();
  useScrollToTop();

  return (
    <ThemeProvider>
      <Router />
    </ThemeProvider>
  );
}
