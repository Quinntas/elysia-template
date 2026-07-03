import { Command } from "../../../../contracts/command";
import { HttpError } from "../../../../contracts/httpError";
import { TodoRepo } from "../../repo/todo.repo";
import { UpdateTodoInput, UpdateTodoOutput } from "./updateTodo.io";

export class UpdateTodoCommand extends Command<UpdateTodoInput, UpdateTodoOutput> {
  constructor(private readonly updateTodoById: typeof TodoRepo.updateTodoById) {
    super("UpdateTodoCommand");
  }

  async handle(data: UpdateTodoInput): Promise<UpdateTodoOutput> {
    const todo = await this.updateTodoById(data);

    if (!todo) {
      throw new HttpError({ status: 404, message: "Todo not found" });
    }

    return { data: todo };
  }
}
