import axios from 'axios';
import { useState } from 'react';
import PropTypes from 'prop-types';

import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
// import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Popover from '@mui/material/Popover';
import TableRow from '@mui/material/TableRow';
// import Checkbox from '@mui/material/Checkbox';
import MenuItem from '@mui/material/MenuItem';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';

import EditPlanDialog from './plan-edit-dialog';

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
  const [open, setOpen] = useState(null);
  const [isConfirmationDeleteOpen, setConfirmationOpen] = useState(false);
  const [isConfirmationEditOpen, setConfirmationEditOpen] = useState(false);
  const [isConfirmationActivateOpen, setConfirmationActivateOpen] = useState(false);

  const handleOpenMenu = (event) => {
    setOpen(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpen(null);
  };
  const handleEditDialogMenu = () => {
    setConfirmationEditOpen(true);
    setOpen(null);
  };
  const handleDelete = async () => {
    setConfirmationOpen(false); // Close the confirmation dialog
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

  const handleActivate = async () => {
    setConfirmationActivateOpen(false);
    try {
      setOpen(null);
      const token = localStorage.getItem('token');
      const response = await axios.patch(`http://localhost:3001/plan/${id}/activate`, null, {
        headers: {
          Authorization: token,
        },
      });
      fetchPlans();

      console.log('Plan activated successfully:', response.data);
    } catch (error) {
      console.error('Error activating plan:', error);
    }
  };

  const handleDeactivate = async () => {
    setConfirmationActivateOpen(false);
    try {
      setOpen(null);
      const token = localStorage.getItem('token');
      const response = await axios.patch(`http://localhost:3001/plan/${id}/deactivate`, null, {
        headers: {
          Authorization: token,
        },
      });
      fetchPlans();

      console.log('Plan deactivated successfully:', response.data);
    } catch (error) {
      console.error('Error deactivating plan:', error);
    }
  };

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

        <TableCell>
          <Label color={status === 'active' ? 'success' : 'error'}>{status}</Label>
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
      >
        <MenuItem onClick={handleEditDialogMenu}>
          <Iconify icon="eva:edit-fill" sx={{ mr: 2 }} />
          Edit
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

      {/* Edit Dialog */}

      <EditPlanDialog
        id={id}
        isConfirmationEditOpen={isConfirmationEditOpen}
        setConfirmationEditOpen={setConfirmationEditOpen}
        name={name}
        fetchPlans={fetchPlans}
        description={description}
        duration={duration}
        price={price}
        status={status}
      />
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
