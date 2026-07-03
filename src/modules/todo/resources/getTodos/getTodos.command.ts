import { Command } from "../../../../contracts/command";
import { TodoRepo } from "../../repo/todo.repo";
import { GetTodosInput, GetTodosOutput } from "./getTodos.io";

export class GetTodosCommand extends Command<GetTodosInput, GetTodosOutput> {
  constructor(private readonly todoRepository: TodoRepo) {
    super("GetTodosCommand");
  }

  async handle(data: GetTodosInput): Promise<GetTodosOutput> {
    const todos = await this.todoRepository.getTodosByUserId(data.userId);
    return { data: todos };
  }
}
