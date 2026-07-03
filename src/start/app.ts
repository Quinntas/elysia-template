import { Elysia } from "elysia";
import { authRouter, authSecuritySchemes, OpenAPI } from "./auth";
import { openapi } from "@elysia/openapi";
import corsPlugin from "@elysia/cors";
import { opentelemetry } from "@elysia/opentelemetry";

import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import { healthCheckRouter } from "../modules/healthcheck/router/healthcheck.router";
import { todoRouter } from "../modules/todo/router/todo.router";
import { HttpError } from "../contracts/httpError";

const authOpenAPIComponents = await OpenAPI.components;
const authOpenAPIPaths = await OpenAPI.getPaths();

export const app = new Elysia()
  .use(
    corsPlugin({
      origin: "http://localhost:3000",
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  )
  .onError(({ error, set }) => {
    if (error instanceof HttpError) {
      set.status = error.props.status;
      return error.props;
    }

    return undefined;
  })
  .use(
    openapi({
      path: "/docs",
      scalar: {
        spec: {
          url: "/docs/json",
        },
      },
      documentation: {
        servers: [
          {
            url: "http://localhost:3000",
            description: "Local",
          },
        ],
        info: {
          title: "Elysia template",
          version: "1.0.0",
          description: "API documentation",
        },
        components: {
          ...authOpenAPIComponents,
          // @ts-expect-error Better Auth returns a structurally compatible OpenAPI object
          securitySchemes: {
            ...authOpenAPIComponents.securitySchemes,
            ...authSecuritySchemes,
          },
        },
        // @ts-expect-error Better Auth returns a structurally compatible OpenAPI object
        paths: authOpenAPIPaths,
      },
    }),
  )
  .use(
    opentelemetry({
      spanProcessors: [new BatchSpanProcessor(new OTLPTraceExporter())],
    }),
  )
  .use(authRouter)
  .use(healthCheckRouter)
  .use(todoRouter)
  .listen(3000);
