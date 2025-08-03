import { Request, Response } from 'express';
import { AutomationRepo } from './automation.repo';

export class AutomationsCtrl {
  public static async getAutomations(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const pageSize = parseInt(req.query.pageSize as string, 10) || 10;
      const result = await AutomationRepo.getAutomations(page, pageSize);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error?.message });
    }
  }
}
