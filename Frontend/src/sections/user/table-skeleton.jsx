import PropTypes from 'prop-types';

import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Skeleton from '@mui/material/Skeleton';

// ----------------------------------------------------------------------
// Shimmer skeleton rows for table loading (checkbox + 8 columns + actions = 10 cells)
// ----------------------------------------------------------------------

const COLUMN_COUNT = 10;

export default function TableSkeleton({ rowCount = 5 }) {
  return (
    <>
      {Array.from({ length: rowCount }).map((_, index) => (
        <TableRow key={index}>
          <TableCell padding="checkbox">
            <Skeleton variant="rectangular" width={20} height={20} sx={{ borderRadius: 1 }} animation="wave" />
          </TableCell>
          {Array.from({ length: COLUMN_COUNT - 1 }).map((_unused, i) => (
            <TableCell key={i} align={i === 0 ? 'center' : 'left'}>
              <Skeleton
                variant="text"
                width={i === 0 ? '80%' : `${55 + (i % 3) * 20}%`}
                height={24}
                animation="wave"
                sx={{ maxWidth: i === 0 ? 120 : 180 }}
              />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

TableSkeleton.propTypes = {
  rowCount: PropTypes.number,
};
