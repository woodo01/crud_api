import { IncomingMessage, ServerResponse } from 'http';
import { parse } from "url";
import userController from "../controllers/user";

export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
}

export enum HttpStatusCode {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
  BAD_GATEWAY = 502,
}

export function requestHandler(req: IncomingMessage, res: ServerResponse): void {
  try {
    const pathname = parse(req.url || "", true).pathname || "";
    const method = req.method || "";
    const pathRegexp = pathname.match(/^\/api\/users\/([0-9a-fA-F-]+)$/);
    const id = pathRegexp ? pathRegexp[1] : '';

    switch (pathname) {
      case '/api/users':
        if (method === HttpMethod.POST) {
          userController.createUser(req, res);
        }
        if (method === HttpMethod.GET) {
          userController.getAllUsers(req, res);
        }
        break;
      case `/api/users/${id}`:
        if (method === HttpMethod.GET) {
          userController.getUser(req, res, id);
        }
        if (method === HttpMethod.PUT) {
          userController.updateUser(req, res, id);
        }
        if (method === HttpMethod.DELETE) {
          userController.deleteUser(req, res, id);
        }
        break;
      default:
        res.writeHead(HttpStatusCode.NOT_FOUND, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Endpoint not found" }));
    }
  } catch {
    res.writeHead(HttpStatusCode.INTERNAL_SERVER_ERROR, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Internal server error" }));
  }
}
