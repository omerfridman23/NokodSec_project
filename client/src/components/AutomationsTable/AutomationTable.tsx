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
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import RefreshIcon from '@mui/icons-material/Refresh';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import Gateway, { SortOrder, FilterOptions } from '@src/api/gateway';
import { toTitleCase } from '@src/common/utils';

import type { Automation } from '@sharedTypes/types';

const AutomationTable = (): JSX.Element => {
  const STORAGE_KEY = 'automations-table-state';
  
  // Helper functions for localStorage
  const saveStateToStorage = (state: { page: number; pageSize: number; sortOrders: SortOrder[]; filterOptions: FilterOptions }) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn('Failed to save table state to localStorage:', error);
    }
  };

  const loadStateFromStorage = (): { page: number; pageSize: number; sortOrders: SortOrder[]; filterOptions: FilterOptions } | null => {
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
      sortOrders: storedState?.sortOrders ?? [],
      filterOptions: storedState?.filterOptions ?? { filters: {} }
    };
  };

  const initialState = initializeState();
  const [automationsData, setAutomationsData] = useState<Automation[]>([]);
  const [page, setPage] = useState(initialState.page);
  const [pageSize, setPageSize] = useState(initialState.pageSize);
  const [totalCount, setTotalCount] = useState(0);
  const [sortOrders, setSortOrders] = useState<SortOrder[]>(initialState.sortOrders);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>(initialState.filterOptions);
  const [sampleData, setSampleData] = useState<Automation[]>([]);
  const [customFilterInputs, setCustomFilterInputs] = useState<Record<string, string>>({});

  const headers: (keyof Automation)[] = ['id', 'name', 'type', 'status', 'creationTime'];
  const filterableColumns: (keyof Automation)[] = ['name', 'type', 'status', 'creationTime'];

  // Save state to localStorage whenever relevant state changes
  useEffect(() => {
    saveStateToStorage({ page, pageSize, sortOrders, filterOptions });
  }, [page, pageSize, sortOrders, filterOptions]);

  useEffect(() => {
    const fetchAutomationsData = async (): Promise<void> => {
      const response = await Gateway.getAutomations(
        page + 1, // Convert 0-based to 1-based page number
        pageSize,
        sortOrders,
        filterOptions
      );
      const { data, total } = response?.data || { data: [], total: 0 };
      setAutomationsData(data);
      setTotalCount(total);
    };
    fetchAutomationsData();
  }, [page, pageSize, sortOrders, filterOptions]);

  // Fetch sample data for filters (first page with larger size)
  useEffect(() => {
    const fetchSampleData = async (): Promise<void> => {
      try {
        const response = await Gateway.getAutomations(1, 5); // Get first 5 items for sample data
        const { data } = response?.data || { data: [], total: 0 };
        setSampleData(data);
      } catch (error) {
        console.warn('Failed to fetch sample data for filters:', error);
      }
    };
    fetchSampleData();
  }, []);

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
    setFilterOptions({ filters: {} });
    setCustomFilterInputs({});
    clearStoredState();
  };

  // Filter helper functions
  const getSampleValues = (column: keyof Automation): string[] => {
    const values = sampleData.map(item => String(item[column]));
    const uniqueValues = Array.from(new Set(values));
    return uniqueValues.slice(0, 3); // Return first 3 unique values
  };

  const handlePresetFilterToggle = (column: keyof Automation, value: string) => {
    setFilterOptions(prev => {
      const currentFilters = prev.filters || {};
      const currentColumnFilter = currentFilters[column] || { filterValues: [] };
      const isSelected = currentColumnFilter.filterValues.includes(value);
      
      const newFilterValues = isSelected
        ? currentColumnFilter.filterValues.filter(v => v !== value)
        : [...currentColumnFilter.filterValues, value];

      if (newFilterValues.length === 0) {
        const { [column]: removed, ...restFilters } = currentFilters;
        return { ...prev, filters: restFilters };
      }

      return {
        ...prev,
        filters: {
          ...currentFilters,
          [column]: { filterValues: newFilterValues }
        }
      };
    });
    setPage(0); // Reset to first page when filters change
  };

  const handleCustomFilterChange = (column: keyof Automation, value: string) => {
    setCustomFilterInputs(prev => ({
      ...prev,
      [column]: value
    }));
  };

  const handleAddCustomFilter = (column: keyof Automation) => {
    const customValue = customFilterInputs[column]?.trim();
    if (!customValue) return;

    setFilterOptions(prev => {
      const currentFilters = prev.filters || {};
      const currentColumnFilter = currentFilters[column] || { filterValues: [] };
      
      if (currentColumnFilter.filterValues.includes(customValue)) return prev;

      return {
        ...prev,
        filters: {
          ...currentFilters,
          [column]: {
            filterValues: [...currentColumnFilter.filterValues, customValue]
          }
        }
      };
    });

    setCustomFilterInputs(prev => ({
      ...prev,
      [column]: ''
    }));
    setPage(0); // Reset to first page when filters change
  };

  const handleRemoveFilter = (column: keyof Automation, value: string) => {
    setFilterOptions(prev => {
      const currentFilters = prev.filters || {};
      const currentColumnFilter = currentFilters[column];
      if (!currentColumnFilter) return prev;

      const newFilterValues = currentColumnFilter.filterValues.filter(v => v !== value);
      
      if (newFilterValues.length === 0) {
        const { [column]: removed, ...restFilters } = currentFilters;
        return { ...prev, filters: restFilters };
      }

      return {
        ...prev,
        filters: {
          ...currentFilters,
          [column]: { filterValues: newFilterValues }
        }
      };
    });
    setPage(0); // Reset to first page when filters change
  };

  const renderTableHeader = (): JSX.Element => (
    <TableHead sx={{ background: 'lightgreen' }}>
      <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
        {headers.map((header) => {
          const sortDirection = getSortDirection(header);
          const sortPriority = getSortPriority(header);
          const isFilterable = filterableColumns.includes(header);
          const sampleValues = isFilterable ? getSampleValues(header) : [];
          const currentFilter = filterOptions.filters?.[header];
          const hasFilter = !!currentFilter;
          
          return (
            <TableCell key={header} sx={{ minWidth: 200 }}>
              {/* Header title and sort controls */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
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

              {/* Filter Section - Only for filterable columns */}
              {isFilterable && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {/* Sample Values */}
                  {sampleValues.length > 0 && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {sampleValues.map((value) => (
                        <Chip
                          key={value}
                          label={value.length > 15 ? `${value.substring(0, 15)}...` : value}
                          size="small"
                          clickable
                          variant={currentFilter?.filterValues.includes(value) ? 'filled' : 'outlined'}
                          color={currentFilter?.filterValues.includes(value) ? 'primary' : 'default'}
                          onClick={() => handlePresetFilterToggle(header, value)}
                          sx={{ fontSize: '0.7rem', height: '20px' }}
                        />
                      ))}
                    </Box>
                  )}

                  {/* Custom Input */}
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <TextField
                      size="small"
                      placeholder="Custom value"
                      value={customFilterInputs[header] || ''}
                      onChange={(e) => handleCustomFilterChange(header, e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleAddCustomFilter(header);
                        }
                      }}
                      sx={{ 
                        '& .MuiInputBase-input': { 
                          fontSize: '0.75rem',
                          padding: '4px 8px'
                        }
                      }}
                    />
                    <Button
                      size="small"
                      onClick={() => handleAddCustomFilter(header)}
                      disabled={!customFilterInputs[header]?.trim()}
                      sx={{ 
                        minWidth: '32px',
                        fontSize: '0.7rem',
                        padding: '2px 8px'
                      }}
                    >
                      Add
                    </Button>
                  </Box>

                  {/* Active Filters */}
                  {hasFilter && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {currentFilter.filterValues.map((value) => (
                        <Chip
                          key={value}
                          label={value.length > 15 ? `${value.substring(0, 15)}...` : value}
                          size="small"
                          onDelete={() => handleRemoveFilter(header, value)}
                          color="secondary"
                          sx={{ fontSize: '0.7rem', height: '20px' }}
                        />
                      ))}
                    </Box>
                  )}
                </Box>
              )}
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
