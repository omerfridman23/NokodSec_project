import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  Button,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  SelectChangeEvent
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import { FilterOptions, FilterParams } from '@src/api/gateway';
import type { Automation } from '@sharedTypes/types';

interface FilterPanelProps {
  onFilterChange: (filterOptions: FilterOptions) => void;
  sampleData: Automation[];
}

const FilterPanel = ({ onFilterChange, sampleData }: FilterPanelProps): JSX.Element => {
  const [filters, setFilters] = useState<FilterParams>({});
  const [globalFilterOperation, setGlobalFilterOperation] = useState<'or' | 'and'>('and');
  const [customInputs, setCustomInputs] = useState<Record<string, string>>({});

  const filterableColumns: (keyof Automation)[] = ['name', 'type', 'status', 'creationTime'];

  // Get sample values for each column
  const getSampleValues = (column: keyof Automation): string[] => {
    const values = sampleData.map(item => String(item[column]));
    const uniqueValues = Array.from(new Set(values));
    return uniqueValues.slice(0, 3); // Return first 3 unique values
  };

  useEffect(() => {
    const filterOptions: FilterOptions = {
      filters,
      globalFilterOperation
    };
    onFilterChange(filterOptions);
  }, [filters, globalFilterOperation, onFilterChange]);

  const handleColumnOperationChange = (column: keyof Automation, operation: 'or' | 'and') => {
    setFilters(prev => ({
      ...prev,
      [column]: {
        ...prev[column],
        operation
      }
    }));
  };

  const handlePresetValueToggle = (column: keyof Automation, value: string) => {
    setFilters(prev => {
      const currentFilter = prev[column] || { filterValues: [], operation: 'or' };
      const isSelected = currentFilter.filterValues.includes(value);
      
      const newFilterValues = isSelected
        ? currentFilter.filterValues.filter(v => v !== value)
        : [...currentFilter.filterValues, value];

      if (newFilterValues.length === 0) {
        const { [column]: removed, ...rest } = prev;
        return rest;
      }

      return {
        ...prev,
        [column]: {
          ...currentFilter,
          filterValues: newFilterValues
        }
      };
    });
  };

  const handleCustomInputChange = (column: keyof Automation, value: string) => {
    setCustomInputs(prev => ({
      ...prev,
      [column]: value
    }));
  };

  const handleAddCustomValue = (column: keyof Automation) => {
    const customValue = customInputs[column]?.trim();
    if (!customValue) return;

    setFilters(prev => {
      const currentFilter = prev[column] || { filterValues: [], operation: 'or' };
      if (currentFilter.filterValues.includes(customValue)) return prev;

      return {
        ...prev,
        [column]: {
          ...currentFilter,
          filterValues: [...currentFilter.filterValues, customValue]
        }
      };
    });

    setCustomInputs(prev => ({
      ...prev,
      [column]: ''
    }));
  };

  const handleRemoveFilterValue = (column: keyof Automation, value: string) => {
    setFilters(prev => {
      const currentFilter = prev[column];
      if (!currentFilter) return prev;

      const newFilterValues = currentFilter.filterValues.filter(v => v !== value);
      
      if (newFilterValues.length === 0) {
        const { [column]: removed, ...rest } = prev;
        return rest;
      }

      return {
        ...prev,
        [column]: {
          ...currentFilter,
          filterValues: newFilterValues
        }
      };
    });
  };

  const clearAllFilters = () => {
    setFilters({});
    setCustomInputs({});
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Filters</Typography>
        {hasActiveFilters && (
          <Button size="small" onClick={clearAllFilters}>
            Clear All
          </Button>
        )}
      </Box>

      {hasActiveFilters && (
        <Box sx={{ mb: 2 }}>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Global Filter Operation</InputLabel>
            <Select
              value={globalFilterOperation}
              label="Global Filter Operation"
              onChange={(e: SelectChangeEvent) => setGlobalFilterOperation(e.target.value as 'or' | 'and')}
            >
              <MenuItem value="and">AND (All columns must match)</MenuItem>
              <MenuItem value="or">OR (Any column can match)</MenuItem>
            </Select>
          </FormControl>
        </Box>
      )}

      {filterableColumns.map((column) => {
        const sampleValues = getSampleValues(column);
        const currentFilter = filters[column];
        const hasFilter = !!currentFilter;

        return (
          <Accordion key={column} sx={{ mb: 1 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography>{column.charAt(0).toUpperCase() + column.slice(1)}</Typography>
                {hasFilter && (
                  <Chip 
                    size="small" 
                    label={`${currentFilter.filterValues.length} filter(s)`}
                    color="primary"
                  />
                )}
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Column Operation Selection */}
                {hasFilter && (
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Operation</InputLabel>
                    <Select
                      value={currentFilter.operation}
                      label="Operation"
                      onChange={(e: SelectChangeEvent) => 
                        handleColumnOperationChange(column, e.target.value as 'or' | 'and')
                      }
                    >
                      <MenuItem value="or">OR (Any value)</MenuItem>
                      <MenuItem value="and">AND (All values)</MenuItem>
                    </Select>
                  </FormControl>
                )}

                {/* Sample Values */}
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Sample Values:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {sampleValues.map((value) => (
                      <Chip
                        key={value}
                        label={value}
                        clickable
                        variant={currentFilter?.filterValues.includes(value) ? 'filled' : 'outlined'}
                        color={currentFilter?.filterValues.includes(value) ? 'primary' : 'default'}
                        onClick={() => handlePresetValueToggle(column, value)}
                      />
                    ))}
                  </Box>
                </Box>

                {/* Custom Input */}
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Custom Value:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <TextField
                      size="small"
                      placeholder={`Enter ${column} value...`}
                      value={customInputs[column] || ''}
                      onChange={(e) => handleCustomInputChange(column, e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleAddCustomValue(column);
                        }
                      }}
                    />
                    <Button
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={() => handleAddCustomValue(column)}
                      disabled={!customInputs[column]?.trim()}
                    >
                      Add
                    </Button>
                  </Box>
                </Box>

                {/* Active Filter Values */}
                {hasFilter && (
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Active Filters:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {currentFilter.filterValues.map((value) => (
                        <Chip
                          key={value}
                          label={value}
                          onDelete={() => handleRemoveFilterValue(column, value)}
                          color="primary"
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Paper>
  );
};

export default FilterPanel;
