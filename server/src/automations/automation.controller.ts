import { Request, Response } from 'express';
import { AutomationRepo, SortOrder, FilterOptions } from './automation.repo';

export class AutomationsCtrl {
  public static async getAutomations(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const pageSize = parseInt(req.query.pageSize as string, 10) || 10;
      
      // Parse sort orders from query parameters
      let sortOrders: SortOrder[] = [];
      if (req.query.sort) {
        try {
          const sortParam = Array.isArray(req.query.sort) ? req.query.sort[0] : req.query.sort;
          sortOrders = JSON.parse(sortParam as string);
        } catch {
          // If parsing fails, use empty sort orders
          sortOrders = [];
        }
      }
      
      // Parse filter options from query parameters
      let filterOptions: FilterOptions | undefined;
      if (req.query.filters) {
        try {
          const filtersParam = Array.isArray(req.query.filters) ? req.query.filters[0] : req.query.filters;
          filterOptions = JSON.parse(filtersParam as string);
        } catch {
          // If parsing fails, use undefined
          filterOptions = undefined;
        }
      }
      
      const result = await AutomationRepo.getAutomations(page, pageSize, sortOrders, filterOptions);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error?.message });
    }
  }
}
