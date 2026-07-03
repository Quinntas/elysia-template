import Elysia, { t } from "elysia";
import { createTodoCommand } from "../resources/createTodo";
import { deleteTodoCommand } from "../resources/deleteTodo";
import { getTodosCommand } from "../resources/getTodos";
import { updateTodoCommand } from "../resources/updateTodo";
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
      app
        .get("/", ({ session }) => getTodosCommand.run({ userId: session.userId }), {
          detail: {
            summary: "List todos",
          },
          response: {
            200: t.Object({
              data: t.Array(selectTodoSchema),
            }),
          },
        })
        .post(
          "/",
          ({ body, session }) => createTodoCommand.run({ title: body.title, userId: session.userId }),
          {
            body: t.Object({
              title: t.String(),
            }),
            detail: {
              summary: "Create todo",
            },
            response: {
              200: t.Object({
                data: selectTodoSchema,
              }),
            },
          },
        )
        .put(
          "/:id",
          ({ body, params, session }) =>
            updateTodoCommand.run({
              id: params.id,
              userId: session.userId,
              changes: { title: body.title, completed: body.completed },
            }),
          {
            params: t.Object({
              id: t.String(),
            }),
            body: t.Object({
              title: t.String(),
              completed: t.Boolean(),
            }),
            detail: {
              summary: "Replace todo",
            },
            response: {
              200: t.Object({
                data: selectTodoSchema,
              }),
              404: t.Object({
                message: t.String(),
              }),
            },
          },
        )
        .patch(
          "/:id",
          ({ body, params, session }) =>
            updateTodoCommand.run({
              id: params.id,
              userId: session.userId,
              changes: body,
            }),
          {
            params: t.Object({
              id: t.String(),
            }),
            body: t.Object({
              title: t.Optional(t.String()),
              completed: t.Optional(t.Boolean()),
            }),
            detail: {
              summary: "Update todo",
            },
            response: {
              200: t.Object({
                data: selectTodoSchema,
              }),
              404: t.Object({
                message: t.String(),
              }),
            },
          },
        )
        .delete(
          "/:id",
          ({ params, session }) => deleteTodoCommand.run({ id: params.id, userId: session.userId }),
          {
            params: t.Object({
              id: t.String(),
            }),
            detail: {
              summary: "Delete todo",
            },
            response: {
              200: t.Object({
                data: selectTodoSchema,
              }),
              404: t.Object({
                message: t.String(),
              }),
            },
          },
        ),
  );
