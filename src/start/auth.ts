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
  as: "plugin",
}).macro({
  auth: {
    async derive({ status, request: { headers } }) {
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
  as: "plugin",
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
type AuthOpenAPI = Awaited<ReturnType<typeof getSchema>>;
type AuthOpenAPIPath = Exclude<AuthOpenAPI["paths"][string], undefined>;

const isTaggableOperation = (value: unknown): value is { tags?: string[] } => {
  return typeof value === "object" && value !== null;
};

export const OpenAPI = {
  getPaths: async (prefix = "/auth/api"): Promise<AuthOpenAPI["paths"]> => {
    const { paths } = await getSchema();
    const reference: AuthOpenAPI["paths"] = Object.create(null) as AuthOpenAPI["paths"];

    for (const path of Object.keys(paths)) {
      const pathItem = paths[path];

      if (!pathItem) {
        continue;
      }

      const key = prefix + path;
      reference[key] = pathItem;

      for (const method of Object.keys(pathItem)) {
        const operation = pathItem[method as keyof AuthOpenAPIPath];

        if (isTaggableOperation(operation)) {
          operation.tags = ["Better Auth"];
        }
      }
    }

    return reference;
  },
  components: getSchema().then(({ components }) => components),
} as const;
