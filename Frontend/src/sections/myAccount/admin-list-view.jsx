import { useState, useEffect, useCallback } from 'react';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';
import Tooltip from '@mui/material/Tooltip';
import Iconify from 'src/components/iconify';

import api from 'src/api/axios';
import Scrollbar from 'src/components/scrollbar';

import PropTypes from 'prop-types';

import AddSuperAdminDialog from './add-super-admin-dialog';
import EditAdminDialog from './edit-admin-dialog';
import ResetAdminPasswordDialog from './reset-admin-password-dialog';
import DeleteAdminDialog from './delete-admin-dialog';

function isSuperAdmin(roles) {
  return Array.isArray(roles) && roles.includes('Super Admin');
}

export default function AdminListView({ currentUserRoles, currentUserId }) {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editAdmin, setEditAdmin] = useState(null);
  const [resetAdmin, setResetAdmin] = useState(null);
  const [deleteAdmin, setDeleteAdmin] = useState(null);

  const superAdmin = isSuperAdmin(currentUserRoles);

  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/auth/admins');
      setAdmins(res.data?.admins ?? []);
    } catch {
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  const formatRoles = (roles) => (Array.isArray(roles) ? roles.join(', ') : roles || '—');

  const columnCount = 4 + (superAdmin ? 2 : 0); // Name, Email, Phone, Roles, [Password, Actions]

  return (
    <>
      <Card>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2.5 }}>
          <Typography variant="h6">Admins</Typography>
          {superAdmin && (
            <Button
              variant="contained"
              startIcon={<Iconify icon="eva:plus-fill" />}
              onClick={() => setDialogOpen(true)}
            >
              Add Super Admin
            </Button>
          )}
        </Stack>
        <Scrollbar>
          <TableContainer sx={{ overflow: 'unset' }}>
            <Table sx={{ minWidth: 560 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Phone</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Roles</TableCell>
                  {superAdmin && (
                    <>
                      <TableCell sx={{ fontWeight: 600 }}>Password</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="right">
                        Actions
                      </TableCell>
                    </>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {loading && (
                  <TableRow>
                    <TableCell colSpan={columnCount} align="center" sx={{ py: 4 }}>
                      Loading…
                    </TableCell>
                  </TableRow>
                )}
                {!loading && admins.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={columnCount} align="center" sx={{ py: 4 }}>
                      No admins yet
                    </TableCell>
                  </TableRow>
                )}
                {!loading &&
                  admins.length > 0 &&
                  admins.map((row) => (
                    <TableRow key={row._id} hover>
                      <TableCell>{row.name || '—'}</TableCell>
                      <TableCell>{row.email || '—'}</TableCell>
                      <TableCell>{row.phone || '—'}</TableCell>
                      <TableCell>{formatRoles(row.roles)}</TableCell>
                      {superAdmin && (
                        <>
                          <TableCell>
                            <Typography component="span" sx={{ opacity: 0.7 }}>
                              ••••••••
                            </Typography>
                            <Button
                              size="small"
                              onClick={() => setResetAdmin(row)}
                              sx={{ ml: 1 }}
                            >
                              Reset
                            </Button>
                          </TableCell>
                          <TableCell align="right">
                            <Tooltip title="Edit">
                              <IconButton onClick={() => setEditAdmin(row)}>
                                <Iconify icon="eva:edit-2-fill" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={row._id === currentUserId ? 'Cannot delete yourself' : 'Delete'}>
                              <span>
                                <IconButton
                                  color="error"
                                  onClick={() => setDeleteAdmin(row)}
                                  disabled={row._id === currentUserId}
                                >
                                  <Iconify icon="eva:trash-2-outline" />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>
      </Card>

      <AddSuperAdminDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSuccess={fetchAdmins}
      />
      <EditAdminDialog
        open={!!editAdmin}
        onClose={() => setEditAdmin(null)}
        onSuccess={() => {
          fetchAdmins();
          setEditAdmin(null);
        }}
        admin={editAdmin}
      />
      <ResetAdminPasswordDialog
        open={!!resetAdmin}
        onClose={() => setResetAdmin(null)}
        onSuccess={() => {
          setResetAdmin(null);
        }}
        admin={resetAdmin}
      />
      <DeleteAdminDialog
        open={!!deleteAdmin}
        onClose={() => setDeleteAdmin(null)}
        onSuccess={() => {
          fetchAdmins();
          setDeleteAdmin(null);
        }}
        admin={deleteAdmin}
      />
    </>
  );
}

AdminListView.propTypes = {
  currentUserRoles: PropTypes.array,
  currentUserId: PropTypes.string,
};
