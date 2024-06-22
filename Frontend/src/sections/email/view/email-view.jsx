import axios from 'axios';
import { useState, useEffect } from 'react';

import { Grid } from '@mui/material';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';

import Scrollbar from 'src/components/scrollbar';

import TableNoData from '../email-no-data';
import SendEmailForm from './form-new-email';
import UserTableRow from '../email-table-row';
import UserTableHead from '../email-table-head';
import TableEmptyRows from '../email-empty-rows';
import AppWidgetSummary from '../app-widget-summary';
import UserTableToolbar from '../email-table-toolbar';
import { emptyRows, applyFilter, getComparator } from '../utils';

// ----------------------------------------------------------------------

export default function EmailPage() {
  const [page, setPage] = useState(0);

  const [clickedTitle, setClickedTitle] = useState('All Email');

  const [plans, setPlans] = useState([]);

  const [order, setOrder] = useState('asc');

  const [selected, setSelected] = useState([]);

  const [orderBy, setOrderBy] = useState('name');

  const [filterName, setFilterName] = useState('');

  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleCardClick = (title) => {
    setClickedTitle(title);
  };

  const handleSort = (event, id) => {
    const isAsc = orderBy === id && order === 'asc';
    if (id !== '') {
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(id);
    }
  };

  const fetchPlans = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3001/member/emails', {
        headers: {
          Authorization: `${token}`,
        },
      }); // Replace with your API endpoint
      setPlans(response.data.emails);
      console.log('Error fetcaing plans:', response.data);
    } catch (error) {
      console.error('Error fetcaing plans:', error);
    }
  };

  useEffect(() => {
    fetchPlans(); // Fetch plans when the component mounts
  }, [clickedTitle]); // Empty dependency array ensures this effect runs only once

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = plans.map((n) => n.name);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

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
    inputData: plans,
    comparator: getComparator(order, orderBy),
    filterName,
  });

  const notFound = !dataFiltered.length && !!filterName;

  return (
    <Container>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Typography variant="h4">Plans</Typography>
      </Stack>

      <Grid container spacing={3} m={5} gap={4}>
        <Grid xs={12} sm={6} md={3}>
          <AppWidgetSummary
            total="All Email"
            color="success"
            sx={{
              cursor: 'pointer',
              '&:hover': {
                cursor: 'pointer', // Change cursor to pointer on hover
              },
            }}
            onClick={() => handleCardClick('All Email')}
            icon={<img alt="icon" src="/assets/icons/glass/ic_glass_bag.png" />}
          />
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <AppWidgetSummary
            total="Send Email"
            color="info"
            sx={{
              cursor: 'pointer',
              '&:hover': {
                cursor: 'pointer', // Change cursor to pointer on hover
              },
            }}
            onClick={() => handleCardClick('Send Email')}
            icon={<img alt="icon" src="/assets/icons/glass/ic_glass_users.png" />}
          />
        </Grid>
      </Grid>

      <Card>
        {clickedTitle === 'All Email' && (
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
                    rowCount={plans.length}
                    numSelected={selected.length}
                    onRequestSort={handleSort}
                    onSelectAllClick={handleSelectAllClick}
                    headLabel={[
                      // { id: '_id', label: 'Plan Id' },
                      { id: 'name', label: 'Name' },
                      { id: 'email', label: 'Email' },
                      { id: 'subject', label: 'Subject' },
                      { id: 'sendAt', label: 'Send At', align: 'center' },
                      { id: '' },
                    ]}
                  />
                  <TableBody>
                    {dataFiltered
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((row) => (
                        <UserTableRow
                          fetchPlans={fetchPlans}
                          key={row._id}
                          email={row}
                          duration={row.email}
                          description={row.subject}
                          price={row.emailTo}
                          // status={row.isActive ? 'active' : 'inactive'}
                          // avatarUrl={row.avatarUrl}
                          selected={selected.indexOf(row.name) !== -1}
                          handleClick={(event) => handleClick(event, row.name)}
                        />
                      ))}

                    <TableEmptyRows
                      height={77}
                      emptyRows={emptyRows(page, rowsPerPage, plans.length)}
                    />

                    {notFound && <TableNoData query={filterName} />}
                  </TableBody>
                </Table>
              </TableContainer>
            </Scrollbar>

            <TablePagination
              page={page}
              component="div"
              count={plans.length}
              rowsPerPage={rowsPerPage}
              onPageChange={handleChangePage}
              rowsPerPageOptions={[5, 10, 25]}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}{' '}
        {clickedTitle === 'Send Email' && (
          <>
            {/* Send Email here */}
            <SendEmailForm setClickedTitle={setClickedTitle} />
          </>
        )}{' '}
      </Card>
    </Container>
  );
}
