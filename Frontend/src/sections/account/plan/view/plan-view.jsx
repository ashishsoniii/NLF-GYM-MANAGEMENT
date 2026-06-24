import PropTypes from 'prop-types';
import { useState } from 'react';

import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import Typography from '@mui/material/Typography';

import Scrollbar from 'src/components/scrollbar';
import Iconify from 'src/components/iconify';

import UserPaymentDialog from 'src/sections/user/user-payment-dialog';

import TableNoData from '../table-no-data';
import UserTableRow from '../plan-table-row';
import UserTableHead from '../plan-table-head';
import UserTableToolbar from '../plan-table-toolbar';
import { applyFilter, getComparator } from '../utils';

// ----------------------------------------------------------------------

export default function PlanPage({ payments, memberId, curentUser, onPaymentChange }) {
  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [orderBy, setOrderBy] = useState('name');
  const [filterName, setFilterName] = useState('');
  const [addPaymentOpen, setAddPaymentOpen] = useState(false);

  const handleSort = (event, id) => {
    const isAsc = orderBy === id && order === 'asc';
    if (id !== '') {
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(id);
    }
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      setSelected(payments.map((n) => n._id));
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    setSelected(newSelected);
  };

  const handleFilterByName = (event) => {
    setFilterName(event.target.value);
  };

  const dataFiltered = applyFilter({
    inputData: payments,
    comparator: getComparator(order, orderBy),
    filterName,
  });

  const notFound = !dataFiltered.length && !!filterName;

  return (
    <Container>
      <Stack direction="row" alignItems="center" justifyContent="space-between" my={3}>
        <Typography variant="h6">
          All Payment History ({payments.length})
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Iconify icon="eva:plus-fill" />}
          onClick={() => setAddPaymentOpen(true)}
        >
          Add Payment
        </Button>
      </Stack>

      <Card>
        <UserTableToolbar
          numSelected={selected.length}
          filterName={filterName}
          onFilterName={handleFilterByName}
        />
        <Scrollbar>
          <TableContainer sx={{ overflow: 'unset' }}>
            <Table sx={{ minWidth: 800 }}>
              <UserTableHead
                order={order}
                orderBy={orderBy}
                rowCount={payments.length}
                numSelected={selected.length}
                onRequestSort={handleSort}
                onSelectAllClick={handleSelectAllClick}
                headLabel={[
                  { id: 'name', label: 'Plan Name' },
                  { id: 'startDate', label: 'Start Date' },
                  { id: 'endDate', label: 'End Date' },
                  { id: 'duration', label: 'Plan Duration (in Months)' },
                  { id: 'payDate', label: 'Payment Date' },
                  { id: 'price', label: 'Price', align: 'center' },
                  { id: '' },
                ]}
              />
              <TableBody>
                {dataFiltered.map((row) => (
                  <UserTableRow
                    key={row._id}
                    id={row._id}
                    memberId={memberId}
                    name={row.plan.name}
                    duration={row.plan.duration}
                    PaymentDate={row.date}
                    startDate={row.joiningDate}
                    expiryDate={row.expiryDate}
                    price={row.plan.price}
                    selected={selected.indexOf(row._id) !== -1}
                    handleClick={(event) => handleClick(event, row._id)}
                    onDelete={onPaymentChange}
                  />
                ))}
                {notFound && <TableNoData query={filterName} />}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>
      </Card>

      {curentUser && (
        <UserPaymentDialog
          currentDataRow={curentUser}
          isConfirmationEditOpen={addPaymentOpen}
          setConfirmationEditOpen={setAddPaymentOpen}
          id={memberId}
          fetchUsers={onPaymentChange}
        />
      )}
    </Container>
  );
}

PlanPage.propTypes = {
  payments: PropTypes.array.isRequired,
  memberId: PropTypes.string,
  curentUser: PropTypes.object,
  onPaymentChange: PropTypes.func,
};
