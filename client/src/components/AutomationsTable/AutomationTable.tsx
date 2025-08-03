import { useState, useEffect } from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableContainer from '@mui/material/TableContainer';
import Gateway from '@src/api/gateway';
import { toTitleCase } from '@src/common/utils';

import type { Automation } from '@sharedTypes/types';

const AutomationTable = (): JSX.Element => {
  const [automationsData, setAutomationsData] = useState<Automation[]>();

  const headers: (keyof Automation)[] = ['id', 'name', 'status', 'creationTime', 'type'];

  useEffect(() => {
    const fetchAutomationsData = async (): Promise<void> => {
      const response = await Gateway.getAutomations(
        1,
        10
      );
      const automationsRes = response?.data;
      setAutomationsData(automationsRes);
    };
    fetchAutomationsData();
  }, []);

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
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: '1000px', overflow: 'scroll' }} aria-label="simple table">
        {renderTableHeader()}
        {renderTableBody()}
      </Table>
    </TableContainer>
  );
};

export default AutomationTable;
