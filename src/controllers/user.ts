import { IncomingMessage, ServerResponse, STATUS_CODES } from 'http';
import { validate as isUuid } from 'uuid';
import userStorage from '../storage/Users'
import { HttpStatusCode } from "../routes/users";

class UserController {
  getAllUsers(req: IncomingMessage, res: ServerResponse): void {
    res.writeHead(HttpStatusCode.OK, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(userStorage.getAllUsers()));
  }

  getUser(req: IncomingMessage, res: ServerResponse, id: string): void {
    if (!isUuid(id)) {
      res.writeHead(HttpStatusCode.BAD_REQUEST, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Invalid user ID format' }));
      return;
    }

    const user = userStorage.findUser(id);
    if (user) {
      res.writeHead(HttpStatusCode.OK, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(user));
    } else {
      res.writeHead(HttpStatusCode.NOT_FOUND, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'User not found' }));
    }
  }

  createUser(req: IncomingMessage, res: ServerResponse): void {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        const { username, age, hobbies } = JSON.parse(body);
        if (!username || typeof age !== 'number' || !Array.isArray(hobbies)) {
          res.writeHead(HttpStatusCode.BAD_REQUEST, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Invalid or missing user data' }));
          return;
        }
        res.writeHead(HttpStatusCode.CREATED, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(userStorage.createUser({ username, age, hobbies })));
      } catch {
        res.writeHead(HttpStatusCode.BAD_REQUEST, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Invalid JSON format' }));
      }
    });
  }

  updateUser(req: IncomingMessage, res: ServerResponse, id: string): void {
    if (!isUuid(id)) {
      res.writeHead(HttpStatusCode.BAD_REQUEST, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Invalid user ID format' }));
      return;
    }
    if (!userStorage.findUser(id)) {
      res.writeHead(HttpStatusCode.NOT_FOUND, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'User not found' }));
      return;
    }

    let body = '';
    req.on('data', chunk => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        const { username, age, hobbies } = JSON.parse(body);
        if (!username || typeof age !== 'number' || !Array.isArray(hobbies)) {
          res.writeHead(HttpStatusCode.BAD_REQUEST, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Invalid or missing user data' }));
          return;
        }
        res.writeHead(HttpStatusCode.OK, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(userStorage.updateUser(id, { username, age, hobbies })));
      } catch {
        res.writeHead(HttpStatusCode.BAD_REQUEST, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Invalid JSON format' }));
      }
    });
  }

  deleteUser(req: IncomingMessage, res: ServerResponse, id: string): void {
    if (!isUuid(id)) {
      res.writeHead(HttpStatusCode.BAD_REQUEST, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Invalid user ID format' }));
      return;
    }
    if (userStorage.deleteUser(id)) {
      res.writeHead(HttpStatusCode.NO_CONTENT);
      res.end();
    } else {
      res.writeHead(HttpStatusCode.NOT_FOUND, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'User not found' }));
    }
  }
}

export default new UserController() as UserController;
