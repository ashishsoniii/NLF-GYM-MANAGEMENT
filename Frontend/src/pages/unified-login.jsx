import { Helmet } from 'react-helmet-async';

import { UnifiedLoginView } from 'src/sections/login';

// ----------------------------------------------------------------------

export default function UnifiedLoginPage() {
  return (
    <>
      <Helmet>
        <title>Login | NLF Gym</title>
      </Helmet>
      <UnifiedLoginView />
    </>
  );
}
