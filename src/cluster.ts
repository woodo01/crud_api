import { config } from 'dotenv';
import { cpus } from 'node:os';
import cluster from 'node:cluster';
import {
  createServer,
  IncomingMessage,
  ServerResponse,
  request,
  ClientRequest,
} from 'node:http';
import { HttpStatusCode, requestHandler } from "./routes/users";
import { Message } from "./models/message";
import userStorage from './storage/users';

config();

const PORT: number = Number(process.env.PORT) || 4000;
const numCPUs: number = cpus().length - 1;

(function () {
  if (!cluster.isPrimary) {
    const workerPort = PORT + (cluster.worker?.id || 1);
    const server = createServer(requestHandler);
    server.listen(workerPort, (): void => {
      console.log(`Worker ${process.pid} is listening on PORT: ${workerPort}`);
    });

    server.on('error', (error) => {
      console.error(`Error occurred in worker ${process.pid}: ${error.message}`);
    });

    process.send && process.send({ type: "syncRequest" });

    process.on("message", (message: Message) => {
      if (message.type === "sync") {
        userStorage.sync(message.data);
      }
    });

    return;
  }

  console.log(`Master ${process.pid} is running...`);
  const loadBalancer = createServer(
    (req: IncomingMessage, res: ServerResponse): void => {
      const proxyRequest: ClientRequest = request(
        {
          hostname: 'localhost',
          port: PORT + ((req.headers['x-forwarded-for'] ? 1 : 2) % numCPUs) + 1,
          path: req.url,
          method: req.method,
          headers: req.headers,
        },
        (workerRes): void => {
          res.writeHead(workerRes.statusCode ?? HttpStatusCode.INTERNAL_SERVER_ERROR, workerRes.headers);
          workerRes.pipe(res, { end: true });
        },
      );

      proxyRequest.on('error', (error): void => {
        console.error(`Proxy request error: ${error.message}`);
        res.writeHead(HttpStatusCode.BAD_GATEWAY);
        res.end('Bad Gateway');
      });

      req.pipe(proxyRequest, { end: true });
    },
  );

  loadBalancer.listen(PORT, () => console.log(`Load Balancer is listening on PORT: ${PORT}`));

  let workers = [];
  for (let i = 0; i < numCPUs; i++) {
    workers.push(cluster.fork());
  }

  workers.forEach(worker =>  worker.on('message', (msg: Message) => {
    if (msg.type === "syncRequest") {
      worker.send({ type: "sync", data: userStorage.getAllUsers() });
      return;
    }
    if (msg.type === "update") {
      userStorage.sync(msg.data);
      workers
        .filter(w => worker.id != w.id)
        .forEach(w => w.send({ type: "sync", data: userStorage.getAllUsers() }));
      return;
    }
  }))

  cluster.on('exit', (worker, code, signal): void => {
    console.log(`Worker ${worker.process.pid} exited. Code: ${code}, Signal: ${signal}`);
  });
})();
