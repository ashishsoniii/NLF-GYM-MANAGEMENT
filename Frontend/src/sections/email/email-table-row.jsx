import PropTypes from 'prop-types';

import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';


// ----------------------------------------------------------------------

export default function UserTableRow({
  email,
  selected,
}) {
  return (
    <>
      <TableRow hover tabIndex={-1} duration="checkbox" selected={selected}>
        <TableCell>{email.nameTo}</TableCell>

        <TableCell>{email.emailTo}</TableCell>
        <TableCell>{email.subject}</TableCell>

        <TableCell align="center">{ new Date(email.sentAt).toISOString().slice(0, 10).split('T')[0]}</TableCell>
      </TableRow>
      {/* k */}
    </>
  );
}

UserTableRow.propTypes = {
  email: PropTypes.any,
  selected: PropTypes.any,
};
