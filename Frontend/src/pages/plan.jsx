import { Helmet } from 'react-helmet-async';

import { PlanView } from 'src/sections/plan/view';

// ----------------------------------------------------------------------

export default function UserPage() {
  return (
    <>
      <Helmet>
        <title> Plan | GYM </title>
      </Helmet>

      <PlanView />
    </>
  );
}
