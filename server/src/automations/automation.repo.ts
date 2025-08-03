import fs from 'fs';
import path from 'path';
import { Automation } from '@sharedTypes/types';
import { GetAutomationsException } from '@common/errors';

export class AutomationRepo {
  public static async getAutomations(page: number, pageSize: number): Promise<Automation[]> {
    try {
      const dataFilePath = path.resolve(__dirname, 'automations.json');
      const rawData = fs.readFileSync(dataFilePath, 'utf-8');
      const automations: Automation[] = JSON.parse(rawData);

      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      return automations.slice(startIndex, endIndex);

      return automations;
    } catch (err: any) {
      throw new GetAutomationsException(err?.message);
    }
  }
}
