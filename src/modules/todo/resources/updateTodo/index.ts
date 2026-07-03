import { TodoRepo } from "../../repo/todo.repo";
import { UpdateTodoCommand } from "./updateTodo.command";

export const updateTodoCommand = new UpdateTodoCommand(TodoRepo.updateTodoById);
