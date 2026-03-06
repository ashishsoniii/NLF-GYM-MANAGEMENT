import PropTypes from 'prop-types';

import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Skeleton from '@mui/material/Skeleton';

// ----------------------------------------------------------------------
// Shimmer skeleton for Plan table (checkbox + 6 columns + actions = 8 cells)
// ----------------------------------------------------------------------

const COLUMN_COUNT = 8;

export default function PlanTableSkeleton({ rowCount = 5 }) {
  return (
    <>
      {Array.from({ length: rowCount }).map((_, index) => (
        <TableRow key={index}>
          <TableCell padding="checkbox">
            <Skeleton variant="rectangular" width={20} height={20} sx={{ borderRadius: 1 }} animation="wave" />
          </TableCell>
          {Array.from({ length: COLUMN_COUNT - 1 }).map((_unused, i) => (
            <TableCell key={i} align={i === 4 ? 'center' : 'left'}>
              <Skeleton
                variant="text"
                width={`${50 + (i % 3) * 20}%`}
                height={24}
                animation="wave"
                sx={{ maxWidth: 180 }}
              />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

PlanTableSkeleton.propTypes = {
  rowCount: PropTypes.number,
};
