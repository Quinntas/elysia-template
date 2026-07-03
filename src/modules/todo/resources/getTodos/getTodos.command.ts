import { Command } from "../../../../contracts/command";
import { TodoRepo } from "../../repo/todo.repo";
import { GetTodosInput, GetTodosOutput } from "./getTodos.io";

export class GetTodosCommand extends Command<GetTodosInput, GetTodosOutput> {
  constructor(private readonly getTodosByUserId: typeof TodoRepo.getTodosByUserId) {
    super("GetTodosCommand");
  }

  async handle(data: GetTodosInput): Promise<GetTodosOutput> {
    const todos = await this.getTodosByUserId(data.userId);
    return { data: todos };
  }
}
