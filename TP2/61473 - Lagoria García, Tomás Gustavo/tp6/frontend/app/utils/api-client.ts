import { toast } from 'sonner';

/**
 * Cliente API personalizado que maneja errores 401 automáticamente
 */
export class ApiClient {
  private static onUnauthorized?: () => void;

  /**
   * Configura el callback que se ejecutará cuando haya un error 401
   */
  static setUnauthorizedHandler(handler: () => void) {
    this.onUnauthorized = handler;
  }

  /**
   * Fetch wrapper que detecta errores 401 y ejecuta el handler
   */
  static async fetch(url: string, options?: RequestInit): Promise<Response> {
    const response = await fetch(url, options);

    // Si es 401, ejecutar el handler de no autorizado
    if (response.status === 401) {
      toast.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
      
      if (this.onUnauthorized) {
        this.onUnauthorized();
      }
    }

    return response;
  }
}
