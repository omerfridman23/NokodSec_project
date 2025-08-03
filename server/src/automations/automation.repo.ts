import fs from 'fs';
import path from 'path';
import { Automation } from '@sharedTypes/types';
import { GetAutomationsException } from '@common/errors';

export interface SortOrder {
  column: keyof Automation;
  direction: 'ASC' | 'DESC';
}

export class AutomationRepo {
  private static genericSort<T>(data: T[], sortOrders: SortOrder[]): T[] {
    if (!sortOrders || sortOrders.length === 0) {
      return data;
    }

    return data.sort((a, b) => {
      for (const sortOrder of sortOrders) {
        const { column, direction } = sortOrder;
        const aValue = a[column as keyof T];
        const bValue = b[column as keyof T];

        let comparison = 0;

        // Handle different data types
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          comparison = aValue.localeCompare(bValue);
        } else if (typeof aValue === 'number' && typeof bValue === 'number') {
          comparison = aValue - bValue;
        } else if (aValue instanceof Date && bValue instanceof Date) {
          comparison = aValue.getTime() - bValue.getTime();
        } else {
          // Convert to string for comparison
          comparison = String(aValue).localeCompare(String(bValue));
        }

        if (comparison !== 0) {
          return direction === 'ASC' ? comparison : -comparison;
        }
      }
      return 0;
    });
  }

  public static async getAutomations(
    page: number, 
    pageSize: number, 
    sortOrders?: SortOrder[]
  ): Promise<{ data: Automation[], total: number }> {
    try {
      const dataFilePath = path.resolve(__dirname, 'automations.json');
      const rawData = fs.readFileSync(dataFilePath, 'utf-8');
      const automations: Automation[] = JSON.parse(rawData);

      // Apply sorting if provided
      const sortedAutomations = sortOrders && sortOrders.length > 0 
        ? this.genericSort(automations, sortOrders)
        : automations;

      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedData = sortedAutomations.slice(startIndex, endIndex);

      return {
        data: paginatedData,
        total: sortedAutomations.length
      };
    } catch (err: any) {
      throw new GetAutomationsException(err?.message);
    }
  }
}
