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
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import RefreshIcon from '@mui/icons-material/Refresh';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import Gateway, { SortOrder } from '@src/api/gateway';
import { toTitleCase } from '@src/common/utils';

import type { Automation } from '@sharedTypes/types';

const AutomationTable = (): JSX.Element => {
  const STORAGE_KEY = 'automations-table-state';
  
  // Helper functions for localStorage
  const saveStateToStorage = (state: { page: number; pageSize: number; sortOrders: SortOrder[] }) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn('Failed to save table state to localStorage:', error);
    }
  };

  const loadStateFromStorage = (): { page: number; pageSize: number; sortOrders: SortOrder[] } | null => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.warn('Failed to load table state from localStorage:', error);
      return null;
    }
  };

  const clearStoredState = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear table state from localStorage:', error);
    }
  };

  // Initialize state from localStorage or defaults
  const initializeState = () => {
    const storedState = loadStateFromStorage();
    return {
      page: storedState?.page ?? 0,
      pageSize: storedState?.pageSize ?? 10,
      sortOrders: storedState?.sortOrders ?? []
    };
  };

  const initialState = initializeState();
  const [automationsData, setAutomationsData] = useState<Automation[]>([]);
  const [page, setPage] = useState(initialState.page);
  const [pageSize, setPageSize] = useState(initialState.pageSize);
  const [totalCount, setTotalCount] = useState(0);
  const [sortOrders, setSortOrders] = useState<SortOrder[]>(initialState.sortOrders);

  const headers: (keyof Automation)[] = ['id', 'name', 'type', 'status', 'creationTime'];

  // Save state to localStorage whenever relevant state changes
  useEffect(() => {
    saveStateToStorage({ page, pageSize, sortOrders });
  }, [page, pageSize, sortOrders]);

  useEffect(() => {
    const fetchAutomationsData = async (): Promise<void> => {
      const response = await Gateway.getAutomations(
        page + 1, // Convert 0-based to 1-based page number
        pageSize,
        sortOrders
      );
      const { data, total } = response?.data || { data: [], total: 0 };
      setAutomationsData(data);
      setTotalCount(total);
    };
    fetchAutomationsData();
  }, [page, pageSize, sortOrders]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangePageSize = (event: any) => {
    setPageSize(parseInt(event.target.value, 10));
    setPage(0); // Reset to first page when changing page size
  };

  const handleSort = (column: keyof Automation) => {
    setSortOrders(prevSortOrders => {
      // Check if column is already being sorted
      const existingIndex = prevSortOrders.findIndex(sort => sort.column === column);
      
      if (existingIndex !== -1) {
        // Column exists, toggle direction or remove if it's DESC
        const existingSort = prevSortOrders[existingIndex];
        if (existingSort.direction === 'ASC') {
          // Change to DESC
          const newSortOrders = [...prevSortOrders];
          newSortOrders[existingIndex] = { ...existingSort, direction: 'DESC' };
          return newSortOrders;
        } else {
          // Remove this sort order
          return prevSortOrders.filter((_, index) => index !== existingIndex);
        }
      } else {
        // Add new sort order at the end (lowest priority)
        return [...prevSortOrders, { column, direction: 'ASC' }];
      }
    });
    setPage(0); // Reset to first page when sorting changes
  };

  const getSortDirection = (column: keyof Automation): 'ASC' | 'DESC' | null => {
    const sortOrder = sortOrders.find(sort => sort.column === column);
    return sortOrder ? sortOrder.direction : null;
  };

  const getSortPriority = (column: keyof Automation): number | null => {
    const index = sortOrders.findIndex(sort => sort.column === column);
    return index !== -1 ? index + 1 : null;
  };

  const handleReset = () => {
    setPage(0);
    setPageSize(10);
    setSortOrders([]);
    clearStoredState();
  };

  const renderTableHeader = (): JSX.Element => (
    <TableHead sx={{ background: 'lightgreen' }}>
      <TableRow key="table-header" sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
        {headers.map((header) => {
          const sortDirection = getSortDirection(header);
          const sortPriority = getSortPriority(header);
          
          return (
            <TableCell key={header} sx={{ position: 'relative' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>{toTitleCase(header)}</span>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {sortPriority && (
                    <Box 
                      sx={{ 
                        fontSize: '0.75rem', 
                        color: 'text.secondary', 
                        marginRight: 0.5,
                        minWidth: '1rem',
                        textAlign: 'center'
                      }}
                    >
                      {sortPriority}
                    </Box>
                  )}
                  <IconButton
                    size="small"
                    onClick={() => handleSort(header)}
                    sx={{ 
                      padding: '2px',
                      color: sortDirection ? 'primary.main' : 'action.disabled'
                    }}
                  >
                    {sortDirection === 'ASC' ? (
                      <ArrowUpwardIcon fontSize="small" />
                    ) : sortDirection === 'DESC' ? (
                      <ArrowDownwardIcon fontSize="small" />
                    ) : (
                      <ArrowUpwardIcon fontSize="small" />
                    )}
                  </IconButton>
                </Box>
              </Box>
            </TableCell>
          );
        })}
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshIcon />}
            onClick={handleReset}
            sx={{ minWidth: 'auto' }}
          >
            Reset
          </Button>
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
