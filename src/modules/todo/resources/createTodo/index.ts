import { TodoRepo } from "../../repo/todo.repo";
import { CreateTodoCommand } from "./createTodo.command";

export const createTodoCommand = new CreateTodoCommand(TodoRepo.createTodo);
