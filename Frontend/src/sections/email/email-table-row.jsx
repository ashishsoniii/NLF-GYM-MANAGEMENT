import PropTypes from 'prop-types';

import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Chip from '@mui/material/Chip';

import { fDateLong } from 'src/utils/format-time';

const CATEGORY_LABELS = {
  broadcast: 'Broadcast',
  otp: 'OTP',
  welcome: 'Welcome',
  invoice: 'Invoice',
  custom: 'Custom',
};

// ----------------------------------------------------------------------

export default function UserTableRow({ email, selected }) {
  const category = email.category || 'broadcast';
  const label = CATEGORY_LABELS[category] || category;

  return (
    <TableRow hover tabIndex={-1} duration="checkbox" selected={selected}>
      <TableCell>{email.nameTo}</TableCell>
      <TableCell>{email.emailTo}</TableCell>
      <TableCell>
        <Chip
          label={label}
          size="small"
          variant="outlined"
          sx={{ textTransform: 'capitalize', fontWeight: 600 }}
        />
      </TableCell>
      <TableCell>{email.subject}</TableCell>
      <TableCell align="center">
        <span title={fDateLong(email.sentAt)}>
          {new Date(email.sentAt).toISOString().slice(0, 10).split('T')[0]}
        </span>
      </TableCell>
    </TableRow>
  );
}

UserTableRow.propTypes = {
  email: PropTypes.any,
  selected: PropTypes.any,
};
