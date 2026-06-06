import { todoRepo } from "../../repo";
import { GetTodosCommand } from "./getTodos.command";

export const getTodosCommand = new GetTodosCommand(todoRepo);
