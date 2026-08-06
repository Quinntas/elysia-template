import { Command } from "../../../../contracts/command";
import { TodoNotFoundError } from "../../infra/todo.error";
import { TodoRepo } from "../../repo/todo.repo";
import { UpdateTodoInput, UpdateTodoOutput } from "./updateTodo.io";

export class UpdateTodoCommand extends Command<UpdateTodoInput, UpdateTodoOutput> {
  constructor(private readonly updateTodoById: typeof TodoRepo.updateTodoById) {
    super("UpdateTodoCommand");
  }

  async handle(data: UpdateTodoInput): Promise<UpdateTodoOutput> {
    const todo = await this.updateTodoById(data);

    if (!todo) {
      throw new TodoNotFoundError();
    }

    return { data: todo };
  }
}
