import { Helmet } from 'react-helmet-async';

import { MemberRegisterView } from 'src/sections/member';

export default function MemberRegisterPage() {
  return (
    <>
      <Helmet>
        <title>Register | NLF Gym</title>
      </Helmet>
      <MemberRegisterView />
    </>
  );
}
