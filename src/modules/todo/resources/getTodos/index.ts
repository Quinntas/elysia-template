import { TodoRepo } from "../../repo/todo.repo";
import { GetTodosCommand } from "./getTodos.command";

export const getTodosCommand = new GetTodosCommand(TodoRepo.getTodosByUserId);
