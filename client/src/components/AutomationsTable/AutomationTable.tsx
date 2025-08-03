import { useState, useEffect } from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Gateway from '@src/api/gateway';
import { toTitleCase } from '@src/common/utils';

import type { Automation } from '@sharedTypes/types';

const AutomationTable = (): JSX.Element => {
  const [automationsData, setAutomationsData] = useState<Automation[]>([]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const headers: (keyof Automation)[] = ['id', 'name', 'status', 'creationTime', 'type'];

  useEffect(() => {
    const fetchAutomationsData = async (): Promise<void> => {
      const response = await Gateway.getAutomations(
        page + 1, // Convert 0-based to 1-based page number
        pageSize
      );
      const { data, total } = response?.data || { data: [], total: 0 };
      setAutomationsData(data);
      setTotalCount(total);
    };
    fetchAutomationsData();
  }, [page, pageSize]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangePageSize = (event: any) => {
    setPageSize(parseInt(event.target.value, 10));
    setPage(0); // Reset to first page when changing page size
  };

  const renderTableHeader = (): JSX.Element => (
    <TableHead sx={{ background: 'lightgreen' }}>
      <TableRow key="table-header" sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
        {headers.map((header) => (
          <TableCell key={header}>{toTitleCase(header)}</TableCell>
        ))}
      </TableRow>
    </TableHead>
  );

  const renderTableBody = (): JSX.Element => (
    <TableBody>
      {automationsData?.map((row) => (
        <TableRow key={row.name} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
          {Object.values(row).map((value) => (
            <TableCell key={`${row.name}_${value}`}>{value.toString()}</TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  );

  return (
    <Paper>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Automations</h2>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel id="page-size-select-label">Items per page</InputLabel>
          <Select
            labelId="page-size-select-label"
            id="page-size-select"
            value={pageSize}
            label="Items per page"
            onChange={handleChangePageSize}
          >
            <MenuItem value={5}>5</MenuItem>
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={25}>25</MenuItem>
            <MenuItem value={50}>50</MenuItem>
            <MenuItem value={100}>100</MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      <TableContainer>
        <Table sx={{ minWidth: '1000px' }} aria-label="automations table">
          {renderTableHeader()}
          {renderTableBody()}
        </Table>
      </TableContainer>
      
      <TablePagination
        rowsPerPageOptions={[]}
        component="div"
        count={totalCount}
        rowsPerPage={pageSize}
        page={page}
        onPageChange={handleChangePage}
        showFirstButton
        showLastButton
      />
    </Paper>
  );
};

export default AutomationTable;
