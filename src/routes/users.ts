import { IncomingMessage, ServerResponse } from 'http';
import { parse } from "url";

export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
}

export function requestHandler(req: IncomingMessage, res: ServerResponse): void {
  try {
    const pathname = parse(req.url || "", true).pathname || "";
    const method = req.method || "";
    const pathRegexp = pathname.match(/^\/api\/users\/([0-9a-fA-F-]+)$/);
    const id = pathRegexp ? pathRegexp[1] : null;

    switch (pathname) {
      case '/api/users':
        if (method === HttpMethod.POST) {

        }
        if (method === HttpMethod.GET) {

        }
        break;
      case '/api/users/${id}':
        if (method === HttpMethod.GET) {

        }
        if (method === HttpMethod.PUT) {

        }
        if (method === HttpMethod.DELETE) {

        }
        break;
      default:
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Endpoint not found" }));
    }
  } catch {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Internal server error" }));
  }
}
