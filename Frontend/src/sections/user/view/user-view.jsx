import axios from 'axios';
import { useState, useEffect } from 'react';

import { Grid } from '@mui/material';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';

// import { users } from 'src/_mock/user';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';

import NewUserForm from './new-user-form';
import TableNoData from '../table-no-data';
import UserTableRow from '../user-table-row';
import UserTableHead from '../user-table-head';
import TableEmptyRows from '../table-empty-rows';
import UserTableToolbar from '../user-table-toolbar';
import AppWidgetSummary from '../app-widget-summary';
import { emptyRows, applyFilter, getComparator } from '../utils';

// ----------------------------------------------------------------------

export default function UserPage() {
  const [page, setPage] = useState(0);

  const [clickedTitle, setClickedTitle] = useState('All users');

  const [users, setusers] = useState([]);

  const [order, setOrder] = useState('asc');

  const [selected, setSelected] = useState([]);

  const [orderBy, setOrderBy] = useState('name');

  const [filterName, setFilterName] = useState('');

  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleSort = (event, id) => {
    const isAsc = orderBy === id && order === 'asc';
    if (id !== '') {
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(id);
    }
  };

  const handleCardClick = (title) => {
    setClickedTitle(title);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = users.map((n) => n.name);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      // const response = await axios.get('http://localhost:3001/member/all'); // Replace with your API endpoint
      const response = await axios.get('http://localhost:3001/member/all', {
        headers: {
          Authorization: token,
        },
      });

      setusers(response.data.members);
      console.log(response.data);
      console.log('users Here:', response.data);
    } catch (error) {
      console.error('Error fetcaing plans:', error);
    }
  };

  useEffect(() => {
    fetchUsers(); // Fetch plans when the component mounts
  }, [clickedTitle]); // Empty dependency array ensures this effect runs only once

  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
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

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const handleFilterByName = (event) => {
    setPage(0);
    setFilterName(event.target.value);
  };

  const dataFiltered = applyFilter({
    inputData: users,
    comparator: getComparator(order, orderBy),
    filterName,
  });

  const notFound = !dataFiltered.length && !!filterName;

  return (
    <Container>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Typography variant="h4">users</Typography>

        <Button variant="contained" color="inherit" startIcon={<Iconify icon="eva:plus-fill" />}>
          New User
        </Button>
      </Stack>

      <Grid container spacing={3} m={5} gap={4}>
        <Grid xs={12} sm={6} md={3}>
          <AppWidgetSummary
            total="All users"
            color="success"
            sx={{
              cursor: 'pointer',
              '&:hover': {
                cursor: 'pointer', // Change cursor to pointer on hover
              },
            }}
            onClick={() => handleCardClick('All users')}
            icon={<img alt="icon" src="/assets/icons/glass/ic_glass_bag.png" />}
          />
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <AppWidgetSummary
            total="New Member"
            color="info"
            sx={{
              cursor: 'pointer',
              '&:hover': {
                cursor: 'pointer', // Change cursor to pointer on hover
              },
            }}
            onClick={() => handleCardClick('New Member')}
            icon={<img alt="icon" src="/assets/icons/glass/ic_glass_users.png" />}
          />
        </Grid>
      </Grid>

      <Card>
        {clickedTitle === 'All users' && (
          <>
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
                    rowCount={users.length}
                    numSelected={selected.length}
                    onRequestSort={handleSort}
                    onSelectAllClick={handleSelectAllClick}
                    headLabel={[
                      { id: 'name', label: 'Name', align: 'center' },
                      { id: 'joiningDate', label: 'Joining Date' },
                      { id: 'expiryDate', label: 'Expiry Date' },
                      { id: 'planName', label: 'Plan Name' },
                      { id: 'email', label: 'Email' },
                      { id: 'phone', label: 'Phone' },
                      { id: 'gender', label: 'Gender' },
                      // { id: 'isVerified', label: 'Verified', align: 'center' },
                      { id: 'status', label: 'Status' },
                      { id: '' },
                    ]}
                  />
                  <TableBody>
                    {dataFiltered
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((row) => (
                        <UserTableRow
                          key={row._id}
                          name={row.name}
                          role={row.role}
                          joiningDate={row.joiningDate}
                          expiryDate={row.expiryDate}
                          planName={row.plan}
                          email={row.email}
                          phone={row.phone}
                          gender={row.gender}
                          status={row.status}
                          company={row.company}
                          avatarUrl={row.avatarUrl}
                          isVerified={row.isActive}
                          selected={selected.indexOf(row.name) !== -1}
                          handleClick={(event) => handleClick(event, row.name)}
                        />
                      ))}

                    <TableEmptyRows
                      height={77}
                      emptyRows={emptyRows(page, rowsPerPage, users.length)}
                    />

                    {notFound && <TableNoData query={filterName} />}
                  </TableBody>
                </Table>
              </TableContainer>
            </Scrollbar>

            <TablePagination
              page={page}
              component="div"
              count={users.length}
              rowsPerPage={rowsPerPage}
              onPageChange={handleChangePage}
              rowsPerPageOptions={[5, 10, 25]}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}

        {clickedTitle === 'New Member' && <NewUserForm />}
      </Card>
    </Container>
  );
}
