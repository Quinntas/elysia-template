import { db } from "../../../start/db";
import { TodoRepo } from "./todo.repo";

export const todoRepo = new TodoRepo("todoRepo", db);
