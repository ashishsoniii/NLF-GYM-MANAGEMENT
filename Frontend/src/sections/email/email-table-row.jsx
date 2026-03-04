import PropTypes from 'prop-types';

import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';

import { fDateLong } from 'src/utils/format-time';

// ----------------------------------------------------------------------

export default function UserTableRow({ email, selected }) {
  return (
    <>
      <TableRow hover tabIndex={-1} duration="checkbox" selected={selected}>
        <TableCell>{email.nameTo}</TableCell>

        <TableCell>{email.emailTo}</TableCell>
        <TableCell>{email.subject}</TableCell>

        <TableCell align="center">
          <span title={fDateLong(email.sentAt)}>
            {new Date(email.sentAt).toISOString().slice(0, 10).split('T')[0]}
          </span>
        </TableCell>
      </TableRow>
      {/* k */}
    </>
  );
}

UserTableRow.propTypes = {
  email: PropTypes.any,
  selected: PropTypes.any,
};
