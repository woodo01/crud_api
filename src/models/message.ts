import { User } from "./user";

export interface Message {
  type: string;
  data: User[];
}
