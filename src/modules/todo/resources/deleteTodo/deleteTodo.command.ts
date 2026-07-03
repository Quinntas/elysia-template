import { Command } from "../../../../contracts/command";
import { HttpError } from "../../../../contracts/httpError";
import { TodoRepo } from "../../repo/todo.repo";
import { DeleteTodoInput, DeleteTodoOutput } from "./deleteTodo.io";

export class DeleteTodoCommand extends Command<DeleteTodoInput, DeleteTodoOutput> {
  constructor(private readonly deleteTodoById: typeof TodoRepo.deleteTodoById) {
    super("DeleteTodoCommand");
  }

  async handle(data: DeleteTodoInput): Promise<DeleteTodoOutput> {
    const todo = await this.deleteTodoById(data);

    if (!todo) {
      throw new HttpError({ status: 404, message: "Todo not found" });
    }

    return { data: todo };
  }
}
