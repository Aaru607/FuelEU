import { Request, Response } from 'express';
import { RouteRepository } from '../../outbound/postgres';

/**
 * Inbound HTTP Adapter: Routes Controller
 * Handles GET requests for route information.
 */
export class RoutesController {
  private routeRepository: RouteRepository;

  constructor() {
    this.routeRepository = new RouteRepository();
  }

  async getAllRoutes(req: Request, res: Response): Promise<Response> {
    try {
      const routes = await this.routeRepository.getAllRoutes();
      return res.status(200).json(routes);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Internal server error';
      return res.status(500).json({ error: message });
    }
  }

  async getRouteById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params as { id: string };
      const route = await this.routeRepository.getRouteById(id);

      if (!route) {
        return res.status(404).json({ error: `Route not found: ${id}` });
      }

      return res.status(200).json(route);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Internal server error';
      return res.status(500).json({ error: message });
    }
  }
}
