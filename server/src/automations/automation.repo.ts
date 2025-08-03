import fs from 'fs';
import path from 'path';
import { Automation } from '@sharedTypes/types';
import { GetAutomationsException } from '@common/errors';

export class AutomationRepo {
  public static async getAutomations(page: number, pageSize: number): Promise<{ data: Automation[], total: number }> {
    try {
      const dataFilePath = path.resolve(__dirname, 'automations.json');
      const rawData = fs.readFileSync(dataFilePath, 'utf-8');
      const automations: Automation[] = JSON.parse(rawData);

      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedData = automations.slice(startIndex, endIndex);

      return {
        data: paginatedData,
        total: automations.length
      };
    } catch (err: any) {
      throw new GetAutomationsException(err?.message);
    }
  }
}
