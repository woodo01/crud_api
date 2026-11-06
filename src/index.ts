import { config } from 'dotenv';
import * as process from 'node:process';
import { createServer } from 'node:http';
import { requestHandler } from "./routes/users";

config();

const PORT: number = Number(process.env.PORT) || 4000;

export const server = createServer(requestHandler);

server.listen(PORT, () => console.log(`Server is running on PORT: ${PORT}`));
