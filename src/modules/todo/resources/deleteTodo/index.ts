import { TodoRepo } from "../../repo/todo.repo";
import { DeleteTodoCommand } from "./deleteTodo.command";

export const deleteTodoCommand = new DeleteTodoCommand(TodoRepo.deleteTodoById);
