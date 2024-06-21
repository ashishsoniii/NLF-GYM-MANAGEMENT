import PropTypes from 'prop-types';

import Stack from '@mui/material/Stack';
// import Avatar from '@mui/material/Avatar';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------

export default function UserTableRow({
  fetchPlans,
  selected,
  id,
  avatarUrl,
  name,
  startDate,
  PaymentDate,
  expiryDate,
  description,
  duration,
  price,
  status,
  handleClick,
}) {

  return (
    <>
      <TableRow hover tabIndex={-1} duration="checkbox" selected={selected}>
        <TableCell padding="checkbox">
          {/* <Checkbox disableRipple checked={selected} onChange={handleClick} /> */}
        </TableCell>

        <TableCell component="th" scope="row" padding="none">
          <Stack direction="row" alignItems="center" spacing={2}>
            {/* <Avatar alt={id} src={avatarUrl} /> */}
            <Typography variant="subtitle2" noWrap>
              {name}
            </Typography>
          </Stack>
        </TableCell>

        {/* <TableCell>{name}</TableCell> */}
        <TableCell>{new Date(startDate).toISOString().slice(0, 10).split('T')[0]}</TableCell>
        <TableCell>{new Date(expiryDate).toISOString().slice(0, 10).split('T')[0]}</TableCell>

        <TableCell>{duration} Months</TableCell>
        <TableCell>{new Date(PaymentDate  ).toISOString().slice(0, 10).split('T')[0]}</TableCell>

        <TableCell align="center">{price}</TableCell>

      </TableRow>

      {/* Confirmation Dialog */}


    </>
  );
}

UserTableRow.propTypes = {
  avatarUrl: PropTypes.any,
  name: PropTypes.any,
  handleClick: PropTypes.func,
  fetchPlans: PropTypes.func,
  price: PropTypes.any,
  id: PropTypes.any,
  description: PropTypes.any,
  duration: PropTypes.any,
  startDate: PropTypes.any,
  expiryDate: PropTypes.any,
  PaymentDate: PropTypes.any,
  selected: PropTypes.any,
  status: PropTypes.string,
};

