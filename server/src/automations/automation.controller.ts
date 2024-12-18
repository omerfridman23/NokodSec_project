import { Request, Response } from 'express';
import { AutomationRepo } from './automation.repo';

export class AutomationsCtrl {
  public static async getAutomations(req: Request, res: Response): Promise<void> {
    try {
      const automations = await AutomationRepo.getAutomations();
      res.json(automations);
    } catch (error: any) {
      res.status(500).json({ message: error?.message });
    }
  }
}
