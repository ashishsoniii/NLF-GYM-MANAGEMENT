import { Helmet } from 'react-helmet-async';

import { MemberDashboardView } from 'src/sections/member';

export default function MemberDashboardPage() {
  return (
    <>
      <Helmet>
        <title>Dashboard | Member Portal | NLF Gym</title>
      </Helmet>
      <MemberDashboardView />
    </>
  );
}
