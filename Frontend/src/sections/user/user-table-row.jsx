import { useState } from 'react';
import PropTypes from 'prop-types';
// import { Link } from 'react-router-dom';

import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Popover from '@mui/material/Popover';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import MenuItem from '@mui/material/MenuItem';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
// import AccountPage from 'src/pages/account';

// ----------------------------------------------------------------------

export default function UserTableRow({
  selected,
  name,
  avatarUrl,
  company,
  setcurentUser,
  role,
  isVerified,
  joiningDate,
  expiryDate,
  planName,
  email,
  phone,
  gender,
  status,
  handleClick,
  currentDataRow,
}) {
  const [open, setOpen] = useState(null);

  const handleOpenMenu = (event) => {
    setOpen(event.currentTarget);
  };

  const handleDetailMenu = (event) => {
    setOpen(event.currentTarget);
    setcurentUser(currentDataRow);
  };

  const handleCloseMenu = () => {
    setOpen(null);
  };

  return (
    <>
      <TableRow hover tabIndex={-1} role="checkbox" selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox disableRipple checked={selected} onChange={handleClick} />
        </TableCell>

        <TableCell component="th" scope="row" padding="none">
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar alt={name} src={avatarUrl} />
            <Typography variant="subtitle2" noWrap>
              {name}
            </Typography>
          </Stack>
        </TableCell>

        <TableCell>{new Date(joiningDate).toISOString().slice(0, 10).split('T')[0]}</TableCell>
        <TableCell>{new Date(expiryDate).toISOString().slice(0, 10).split('T')[0]}</TableCell>
        <TableCell>{planName}</TableCell>
        <TableCell>{email}</TableCell>
        <TableCell>{phone}</TableCell>

        <TableCell>{gender}</TableCell>
        {/* <TableCell>{role}</TableCell> */}

        {/* <TableCell align="center">{isVerified ? 'Yes' : 'No'}</TableCell> */}

        <TableCell>
          <Label color={(isVerified === 'banned' && 'error') || 'success'}>
            {isVerified ? 'Active' : 'Disable'}
          </Label>
        </TableCell>

        <TableCell align="right">
          <IconButton onClick={handleOpenMenu}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <Popover
        open={!!open}
        anchorEl={open}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: { width: 140 },
        }}
      >
        <MenuItem onClick={handleCloseMenu}>
          <Iconify icon="eva:edit-fill" sx={{ mr: 2 }} />
          Edit
        </MenuItem>

        {/* <Link to={{ pathname: '/account', state: "dataToPass" }}> */}
        <MenuItem onClick={handleDetailMenu}>
          <Iconify icon="eva:edit-fill" sx={{ mr: 2 }} />
          Detail
        </MenuItem>
        {/* </Link> */}

        <MenuItem onClick={handleCloseMenu} sx={{ color: 'error.main' }}>
          <Iconify icon="eva:trash-2-outline" sx={{ mr: 2 }} />
          Delete
        </MenuItem>
      </Popover>
    </>
  );
}

UserTableRow.propTypes = {
  avatarUrl: PropTypes.any,
  company: PropTypes.any,
  handleClick: PropTypes.func,
  isVerified: PropTypes.any,
  name: PropTypes.any,
  role: PropTypes.any,
  selected: PropTypes.any,
  status: PropTypes.string,
  joiningDate: PropTypes.any,
  expiryDate: PropTypes.any,
  planName: PropTypes.any,
  email: PropTypes.any,
  phone: PropTypes.any,
  gender: PropTypes.any,
  setcurentUser: PropTypes.any,
  currentDataRow: PropTypes.any,
};
