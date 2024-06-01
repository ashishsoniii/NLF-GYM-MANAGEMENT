import { Helmet } from 'react-helmet-async';

import { UserView } from 'src/sections/expiredUser/view';

// ----------------------------------------------------------------------

export default function UserPage() {
  return (
    <>
      <Helmet>
        <title> Expired | GYM </title>
      </Helmet>

      <UserView />
    </>
  );
}
