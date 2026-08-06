import { HTTPError } from "elysia";

export class TodoNotFoundError extends HTTPError.id("todo:not-found", 404) {
  override detail() {
    return "Todo not found";
  }
}
