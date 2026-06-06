import { NodePgDatabase } from "drizzle-orm/node-postgres";

export abstract class Repo {
  constructor(
    private name: string,
    protected db: NodePgDatabase,
  ) {}
}
