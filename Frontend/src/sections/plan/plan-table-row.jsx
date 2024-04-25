import axios from 'axios';
import { useState } from 'react';
import PropTypes from 'prop-types';

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

// ----------------------------------------------------------------------

export default function UserTableRow({
  fetchPlans,
  selected,
  id,
  avatarUrl,
  name,
  description,
  duration,
  price,
  status,
  handleClick,
}) {
  const [open, setOpen] = useState(null);

  const handleOpenMenu = (event) => {
    setOpen(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpen(null);
  };
  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');

      // Send DELETE request to delete the plan
      const response = await axios.delete(`http://localhost:3001/plan/${id}`, {
        headers: {
          Authorization: `${token}`, // Include the token in the Authorization header
        },
      });

      // Refresh plans after successful deletion
      fetchPlans();
      console.log('Plan deleted successfully:', response.data);
    } catch (error) {
      console.error('Error deleting plan:', error);

      // Display error message or notification
      // For example, you can use a state variable to store the error message and display it in your UI
      // setError(error.message);
    }

    setOpen(null);
  };

  return (
    <>
      <TableRow hover tabIndex={-1} duration="checkbox" selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox disableRipple checked={selected} onChange={handleClick} />
        </TableCell>

        <TableCell component="th" scope="row" padding="none">
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar alt={id} src={avatarUrl} />
            <Typography variant="subtitle2" noWrap>
              {id}
            </Typography>
          </Stack>
        </TableCell>

        <TableCell>{name}</TableCell>

        <TableCell>{duration} Months</TableCell>
        <TableCell>{description}</TableCell>

        <TableCell align="center">{price}</TableCell>

        <TableCell>
          <Label color={(status === 'banned' && 'error') || 'success'}>{status}</Label>
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

        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <Iconify icon="eva:trash-2-outline" sx={{ mr: 2 }} />
          Delete
        </MenuItem>
      </Popover>
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
  selected: PropTypes.any,
  status: PropTypes.string,
};
