import fs from 'fs';
import path from 'path';
import { Automation } from '@sharedTypes/types';
import { GetAutomationsException } from '@common/errors';

export class AutomationRepo {
  public static async getAutomations(): Promise<Automation[]> {
    try {
      const dataFilePath = path.resolve(__dirname, 'automations.json');
      const rawData = fs.readFileSync(dataFilePath, 'utf-8');
      const automations: Automation[] = JSON.parse(rawData);
      return automations;
    } catch (err: any) {
      throw new GetAutomationsException(err?.message);
    }
  }
}
