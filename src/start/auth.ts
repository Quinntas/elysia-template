import { Elysia } from "elysia";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import { openAPI } from "better-auth/plugins";

export const auth = betterAuth({
  basePath: "/api",
  experimental: { joins: true },
  plugins: [openAPI()],
  database: drizzleAdapter(db, {
    provider: "pg",
    usePlural: true,
  }),
  emailAndPassword: {
    enabled: true,
  },
});

export const authMacro = new Elysia({
  name: "auth.macro",
}).macro({
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

export const authRouter = new Elysia({
  name: "auth.router",
})
  .mount("/auth", auth.handler)
  .use(authMacro);

export const authSecuritySchemes = {
  bearerAuth: {
    type: "http",
    scheme: "bearer",
  },
  sessionCookie: {
    type: "apiKey",
    in: "cookie",
    name: "better-auth.session_token",
  },
} as const;

let schemaCache: ReturnType<typeof auth.api.generateOpenAPISchema>;
const getSchema = async () => (schemaCache ??= auth.api.generateOpenAPISchema());
export const OpenAPI = {
  getPaths: (prefix = "/auth/api") =>
    getSchema().then(({ paths }) => {
      const reference: typeof paths = Object.create(null);
      for (const path of Object.keys(paths)) {
        const key = prefix + path;
        reference[key] = paths[path];
        for (const method of Object.keys(paths[path])) {
          const operation = (reference[key] as any)[method];
          operation.tags = ["Better Auth"];
        }
      }
      return reference;
    }) as Promise<any>,
  components: getSchema().then(({ components }) => components) as Promise<any>,
} as const;
