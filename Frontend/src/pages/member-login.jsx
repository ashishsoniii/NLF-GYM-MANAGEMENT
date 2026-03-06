import { Helmet } from 'react-helmet-async';

import { MemberLoginView } from 'src/sections/member';

export default function MemberLoginPage() {
  return (
    <>
      <Helmet>
        <title>Member Login | NLF Gym</title>
      </Helmet>
      <MemberLoginView />
    </>
  );
}
