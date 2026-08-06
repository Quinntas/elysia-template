import { describe, expect, it } from "bun:test";
import { Elysia } from "elysia";
import { healthCheckRouter } from "../modules/healthcheck/router/healthcheck.router";
import { TodoNotFoundError } from "../modules/todo/infra/todo.error";

describe("app routes", () => {
  it("returns the healthcheck response", async () => {
    const response = await new Elysia().use(healthCheckRouter).handle("http://localhost:3000/");

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ status: "ok" });
  });

  it("maps native HTTPError to RFC 9457 problem details", async () => {
    const testApp = new Elysia().get("/boom", () => {
      throw new TodoNotFoundError();
    });

    const response = await testApp.handle("http://localhost:3000/boom");

    expect(response.status).toBe(404);
    expect(response.headers.get("content-type")).toContain("application/problem+json");
    await expect(response.json()).resolves.toMatchObject({
      type: "todo:not-found",
      status: 404,
      detail: "Todo not found",
    });
  });
});
