import {
  getSpacesFromDB,
  getSpaceFromDB,
  addSpaceToDB,
} from "@/services/queries";
import { Context } from "hono";

export async function getSpacesHandler(c: Context) {
  const data = await getSpacesFromDB();
  return c.json({ data });
}

export async function createSpaceHandler(c: Context) {
  const { name } = await c.req.json();
  const user = c.get("user");

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const data = await addSpaceToDB(name, user.id);
  return c.json({ data });
}

export async function getSpaceHandler(c: Context) {
  const { id } = c.req.param();
  const data = await getSpaceFromDB(id);
  return c.json({ data: data[0] });
}
