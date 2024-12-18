import { Application, Request, Response } from 'express';
import { AutomationsCtrl } from '../automations/automation.controller';

export default function configureRoutes(app: Application) {
  app.get('/api/health', (req: Request, res: Response) => {
    res.send('Hello! I am healthy!');
  });

  app.get('/automations', AutomationsCtrl.getAutomations);
}
