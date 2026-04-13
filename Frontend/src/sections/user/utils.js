export const visuallyHidden = {
  border: 0,
  margin: -1,
  padding: 0,
  width: '1px',
  height: '1px',
  overflow: 'hidden',
  position: 'absolute',
  whiteSpace: 'nowrap',
  clip: 'rect(0 0 0 0)',
};

export function emptyRows(page, rowsPerPage, arrayLength) {
  return page ? Math.max(0, (1 + page) * rowsPerPage - arrayLength) : 0;
}

function descendingComparator(a, b, orderBy) {
  // Map planName to latestPlanName for sorting
  const actualOrderBy = orderBy === 'planName' ? 'latestPlanName' : orderBy;

  let aValue = a[actualOrderBy];
  let bValue = b[actualOrderBy];

  // Handle null/undefined values
  if (aValue === null || aValue === undefined) {
    return 1;
  }
  if (bValue === null || bValue === undefined) {
    return -1;
  }

  // Handle date fields (joiningDate, expiryDate)
  if (actualOrderBy === 'joiningDate' || actualOrderBy === 'expiryDate') {
    const aDate = new Date(aValue);
    const bDate = new Date(bValue);

    // Check for invalid dates
    if (Number.isNaN(aDate.getTime())) return 1;
    if (Number.isNaN(bDate.getTime())) return -1;

    return bDate - aDate;
  }

  // Handle string fields (case-insensitive comparison)
  if (typeof aValue === 'string' && typeof bValue === 'string') {
    aValue = aValue.toLowerCase();
    bValue = bValue.toLowerCase();
  }

  // Standard comparison
  if (bValue < aValue) {
    return -1;
  }
  if (bValue > aValue) {
    return 1;
  }
  return 0;
}
export function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

export function applyFilter({ inputData, comparator, filterName }) {
  const safeData = Array.isArray(inputData) ? inputData : [];
  const stabilizedThis = safeData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  let result = stabilizedThis.map((el) => el[0]);

  if (filterName) {
    result = result.filter(
      (user) => user.name && user.name.toLowerCase().indexOf(filterName.toLowerCase()) !== -1
    );
  }

  return result;
}
