import {
  getSpacesFromDB,
  getSpaceFromDB,
  addSpaceToDB,
  deleteSpaceFromDB,
  updateSpaceInDB,
} from "@/services/queries";

export async function getSpacesHandler() {
  const data = await getSpacesFromDB();
  return { data };
}

export async function createSpaceHandler(
  name: string,
  userId: string,
  icon: string | null,
  description: string | null,
) {
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const data = await addSpaceToDB(name, userId, icon, description);
  return { data };
}

export async function getSpaceHandler(id: string) {
  const data = await getSpaceFromDB(id);
  return { data };
}

export async function deleteSpaceHandler(id: string) {
  const data = await deleteSpaceFromDB(id);
  return { data };
}

export async function updateSpaceHandler(
  id: string,
  name: string,
  icon: string | null,
  description: string | null,
  userId: string,
) {
  const data = await updateSpaceInDB(id, name, icon, description, userId);
  return { data };
}
