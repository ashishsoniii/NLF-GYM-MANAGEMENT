import { Helmet } from 'react-helmet-async';

import { EmailView } from 'src/sections/email/view';

// ----------------------------------------------------------------------

export default function UserPage() {
  return (
    <>
      <Helmet>
        <title> Email | GYM </title>
      </Helmet>

      <EmailView />
    </>
  );
}
