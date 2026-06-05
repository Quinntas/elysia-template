import { Elysia } from "elysia";
import { auth, OpenAPI } from "./auth";
import { openapi } from "@elysia/openapi";
import corsPlugin from "@elysia/cors";
import { opentelemetry } from "@elysia/opentelemetry";

import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import { healthCheckRouter } from "../modules/healthcheck/router/healthcheck.router";

const betterAuth = new Elysia().mount("/auth", auth.handler).macro({
  auth: {
    async resolve({ status, request: { headers } }) {
      const session = await auth.api.getSession({
        headers,
      });
      if (!session) return status(401);
      return {
        user: session.user,
        session: session.session,
      };
    },
  },
});

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
      documentation: {
        info: {
          title: "Elysia template",
          version: "1.0.0",
        },
        components: await OpenAPI.components,
        paths: await OpenAPI.getPaths(),
      },
    }),
  )
  .use(betterAuth)
  .use(
    opentelemetry({
      spanProcessors: [new BatchSpanProcessor(new OTLPTraceExporter())],
    }),
  )
  .use(healthCheckRouter)
  .listen(3000);
