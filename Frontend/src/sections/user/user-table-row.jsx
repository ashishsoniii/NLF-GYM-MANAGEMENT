import axios from 'axios';
import { useState } from 'react';
import PropTypes from 'prop-types';

import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Popover from '@mui/material/Popover';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import MenuItem from '@mui/material/MenuItem';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function UserTableRow({
  selected,
  id,
  name,
  fetchUsers,
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
  const [isConfirmationDeleteOpen, setConfirmationOpen] = useState(false);
  const [isConfirmationActivateOpen, setConfirmationActivateOpen] = useState(false);

  const handleOpenMenu = (event) => {
    setOpen(event.currentTarget);
  };

  const handleDetailMenu = (event) => {
    setOpen(null);
    console.log("I'm here");
    console.log(currentDataRow);
    setcurentUser(currentDataRow);
  };

  const handleCloseMenu = () => {
    setOpen(null);
  };

  const handleDelete = async () => {
    setConfirmationOpen(false); // Close the confirmation dialog
    try {
      const token = localStorage.getItem('token');

      // Send DELETE request to delete the user
      const response = await axios.delete(`http://localhost:3001/member/delete/${id}`, {
        headers: {
          Authorization: `${token}`, // Include the token in the Authorization header
        },
      });

      // Refresh users after successful deletion
      fetchUsers();
      console.log('User deleted successfully:', response.data);
    } catch (error) {
      console.error('Error deleting user:', error);

      // Display error message or notification
      // For example, you can use a state variable to store the error message and display it in your UI
      // setError(error.message);
    }

    setOpen(null);
  };

  const handleActivate = async () => {
    setConfirmationActivateOpen(false);
    try {
      setOpen(null);
      const token = localStorage.getItem('token');
      const response = await axios.patch(`http://localhost:3001/member/activate/${id}`, null, {
        headers: {
          Authorization: token,
        },
      });
      fetchUsers();

      console.log('User activated successfully:', response.data);
    } catch (error) {
      console.error('Error activating user:', error);
    }
  };

  const handleDeactivate = async () => {
    setConfirmationActivateOpen(false);
    try {
      setOpen(null);
      const token = localStorage.getItem('token');
      const response = await axios.patch(`http://localhost:3001/member/deactivate/${id}`, null, {
        headers: {
          Authorization: token,
        },
      });
      fetchUsers();

      console.log('User deactivated successfully:', response.data);
    } catch (error) {
      console.error('Error deactivating user:', error);
    }
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
            <Typography
              sx={{ cursor: 'pointer' }}
              onClick={handleDetailMenu}
              variant="subtitle2"
              noWrap
            >
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
          <Label color={(!isVerified  && 'error') || 'success'}>
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

        <MenuItem onClick={handleDetailMenu}>
          <Iconify icon="eva:edit-fill" sx={{ mr: 2 }} />
          Detail
        </MenuItem>

        <MenuItem onClick={() => setConfirmationOpen(true)} sx={{ color: 'error.main' }}>
          <Iconify icon="eva:trash-2-outline" sx={{ mr: 2 }} />
          Delete
        </MenuItem>

        {status === 'active' ? (
          <MenuItem onClick={() => setConfirmationActivateOpen(true)}>
            <Iconify icon="eva:power-outline" sx={{ mr: 2 }} />
            Deactivate
          </MenuItem>
        ) : (
          <MenuItem onClick={() => setConfirmationActivateOpen(true)}>
            <Iconify icon="eva:power-outline" sx={{ mr: 2 }} />
            Activate
          </MenuItem>
        )}
      </Popover>

      {/* Confirmation Dialog */}
      <Dialog
        open={isConfirmationDeleteOpen}
        onClose={() => setConfirmationOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography variant="body1">Are you sure you want to delete {name}?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmationOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmationDialog
        open={isConfirmationActivateOpen}
        setOpen={setConfirmationActivateOpen}
        title={status === 'active' ? 'Confirm Deactivation' : 'Confirm Activation'}
        content={`Are you sure you want to ${
          status === 'active' ? 'deactivate' : 'activate'
        } ${name}?`}
        onConfirm={status === 'active' ? handleDeactivate : handleActivate}
      />
    </>
  );
}

UserTableRow.propTypes = {
  id: PropTypes.any,
  avatarUrl: PropTypes.any,
  company: PropTypes.any,
  handleClick: PropTypes.func,
  isVerified: PropTypes.any,
  name: PropTypes.any,
  role: PropTypes.any,
  selected: PropTypes.any,
  fetchUsers: PropTypes.any,
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

function ConfirmationDialog({ open, setOpen, title, content, onConfirm }) {
  const handleClose = () => {
    setOpen(false);
  };

  const handleConfirm = () => {
    onConfirm();
    setOpen(false);
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Typography variant="body1">{content}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleConfirm} color="error">
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
}

ConfirmationDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
  onConfirm: PropTypes.func.isRequired,
};
