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
      // eslint-disable-next-line no-console
      console.log('[RoutesController] GET /routes');
      const routes = await this.routeRepository.getAllRoutes();
      // eslint-disable-next-line no-console
      console.log('[RoutesController] Found', routes.length, 'routes:', routes);
      return res.status(200).json(routes);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Internal server error';
      // eslint-disable-next-line no-console
      console.error('[RoutesController] Database Fetch Error:', message, 'Stack:', error instanceof Error ? error.stack : error);
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
