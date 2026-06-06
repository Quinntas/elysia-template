import Elysia, { t } from "elysia";
import { getTodosCommand } from "../resources/getTodos";
import { selectTodoSchema } from "../repo/todo.schema";
import { authMacro } from "../../../start/auth";

export const todoRouter = new Elysia({
  tags: ["Todos"],
  prefix: "/todos",
})
  .use(authMacro)
  .guard(
    {
      auth: true,
      detail: {
        security: [{ sessionCookie: [] }],
      },
    },
    (app) =>
      app.get("/", ({ session }) => getTodosCommand.run({ userId: session.userId }), {
        detail: {
          summary: "List todos",
        },
        response: {
          200: t.Object({
            data: t.Array(selectTodoSchema),
          }),
        },
      }),
  );
