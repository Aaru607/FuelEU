import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { initializePool } from '../db/db';
import {
  RoutesController,
  ComplianceController,
  BankingController,
  PoolsController,
} from '../../adapters/inbound/http';

/**
 * Server initialization and Express app setup.
 * Wires up all inbound and outbound layers.
 */

export async function createApp(): Promise<Express> {
  const app = express();

  // Enable CORS for local frontend during development
  app.use(cors({ origin: 'http://localhost:5173' }));

  // Middleware
  app.use(express.json());

  // Initialize database connection pool
  initializePool();

  // Instantiate controllers
  const routesController = new RoutesController();
  const complianceController = new ComplianceController();
  const bankingController = new BankingController();
  const poolsController = new PoolsController();

  // Health check
  app.get('/health', (req: Request, res: Response): Response => {
    return res.status(200).json({ status: 'ok' });
  });

  // Routes endpoints
  app.get('/routes', (req: Request, res: Response): Promise<Response> =>
    routesController.getAllRoutes(req, res)
  );
  app.get('/routes/:id', (req: Request, res: Response): Promise<Response> =>
    routesController.getRouteById(req, res)
  );

  // Compliance endpoints
  app.post('/compliance/calculate', (req: Request, res: Response): Promise<Response> =>
    complianceController.calculateComparison(req, res)
  );

  // Banking endpoints
  app.post('/banking/bank-surplus', (req: Request, res: Response): Promise<Response> =>
    bankingController.bankSurplus(req, res)
  );

  // Pools endpoints
  app.post('/pools', (req: Request, res: Response): Promise<Response> =>
    poolsController.createPool(req, res)
  );
  app.get('/pools/:poolId', (req: Request, res: Response): Promise<Response> =>
    poolsController.getPool(req, res)
  );

  // 404 handler
  app.use((req: Request, res: Response): Response => {
    return res.status(404).json({ error: 'Not found' });
  });

  return app;
}

export async function startServer(port: number = 3000): Promise<void> {
  const app = await createApp();
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}
