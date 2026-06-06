import { Elysia } from "elysia";
import { authRouter, authSecuritySchemes, OpenAPI } from "./auth";
import { openapi } from "@elysia/openapi";
import corsPlugin from "@elysia/cors";
import { opentelemetry } from "@elysia/opentelemetry";

import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import { healthCheckRouter } from "../modules/healthcheck/router/healthcheck.router";
import { todoRouter } from "../modules/todo/router/todo.router";

export const app = new Elysia()
  .use(
    corsPlugin({
      origin: "http://localhost:3000",
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  )
  .use(
    openapi({
      path: "/docs",
      scalar: {
        spec: {
          url: "/docs/json",
        },
      },
      documentation: {
        info: {
          title: "Elysia template",
          version: "1.0.0",
          description: "API documentation",
        },
        components: {
          ...(await OpenAPI.components),
          securitySchemes: {
            ...(await OpenAPI.components).securitySchemes,
            ...authSecuritySchemes,
          },
        },
        paths: await OpenAPI.getPaths(),
      },
    }),
  )
  .use(authRouter)
  .use(
    opentelemetry({
      spanProcessors: [new BatchSpanProcessor(new OTLPTraceExporter())],
    }),
  )
  .use(healthCheckRouter)
  .use(todoRouter)
  .listen(3000);
