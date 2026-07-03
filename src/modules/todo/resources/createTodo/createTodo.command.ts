import { Command } from "../../../../contracts/command";
import { TodoRepo } from "../../repo/todo.repo";
import { CreateTodoInput, CreateTodoOutput } from "./createTodo.io";

export class CreateTodoCommand extends Command<CreateTodoInput, CreateTodoOutput> {
  constructor(private readonly createTodo: typeof TodoRepo.createTodo) {
    super("CreateTodoCommand");
  }

  async handle(data: CreateTodoInput): Promise<CreateTodoOutput> {
    const todo = await this.createTodo(data);
    return { data: todo };
  }
}
