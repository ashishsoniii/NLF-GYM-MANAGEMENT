import PropTypes from 'prop-types';
import { useState } from 'react';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import LoadingButton from '@mui/lab/LoadingButton';

import api from 'src/api/axios';
import Iconify from 'src/components/iconify';
import { fDateLong } from 'src/utils/format-time';

// ----------------------------------------------------------------------

export default function UserTableRow({
  selected,
  id,
  memberId,
  name,
  startDate,
  PaymentDate,
  expiryDate,
  duration,
  price,
  handleClick,
  onDelete,
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await api.delete(`/member/${memberId}/payment/${id}`);
      if (typeof onDelete === 'function') await onDelete();
    } catch (e) {
      // Handled by api interceptor
    } finally {
      setLoading(false);
      setConfirmOpen(false);
    }
  };

  const fmt = (d) => {
    try {
      return new Date(d).toISOString().slice(0, 10);
    } catch {
      return '—';
    }
  };

  return (
    <>
      <TableRow hover tabIndex={-1} selected={selected}>
        <TableCell padding="checkbox" />

        <TableCell>
          <Typography variant="subtitle2" noWrap>
            {name}
          </Typography>
        </TableCell>

        <TableCell>
          <span title={fDateLong(startDate)}>{fmt(startDate)}</span>
        </TableCell>
        <TableCell>
          <span title={fDateLong(expiryDate)}>{fmt(expiryDate)}</span>
        </TableCell>
        <TableCell>{duration} Months</TableCell>
        <TableCell>
          <span title={fDateLong(PaymentDate)}>{fmt(PaymentDate)}</span>
        </TableCell>
        <TableCell align="center">₹{price}</TableCell>

        <TableCell align="right">
          <IconButton color="error" onClick={() => setConfirmOpen(true)} title="Remove payment">
            <Iconify icon="eva:trash-2-outline" />
          </IconButton>
        </TableCell>
      </TableRow>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Remove Payment</DialogTitle>
        <DialogContent>
          <Typography>
            Remove the <strong>{name}</strong> payment of <strong>₹{price}</strong>? This cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <LoadingButton color="error" loading={loading} onClick={handleDelete}>
            Remove
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  );
}

UserTableRow.propTypes = {
  selected: PropTypes.any,
  id: PropTypes.any,
  memberId: PropTypes.string,
  name: PropTypes.any,
  startDate: PropTypes.any,
  PaymentDate: PropTypes.any,
  expiryDate: PropTypes.any,
  duration: PropTypes.any,
  price: PropTypes.any,
  handleClick: PropTypes.func,
  onDelete: PropTypes.func,
};
