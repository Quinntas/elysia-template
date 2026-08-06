import { Elysia, t } from "elysia";

export const healthCheckRouter = new Elysia({
  tags: ["Util"],
}).get(
  "/",
  {
    detail: {
      summary: "Health Check",
    },
    response: {
      200: t.Object({
        status: t.String(),
      }),
    },
  },
  () => {
    return { status: "ok" };
  },
);
