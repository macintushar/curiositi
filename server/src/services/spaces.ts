import {
  getSpacesFromDB,
  getSpaceFromDB,
  addSpaceToDB,
} from "@/services/queries";

export async function getSpacesHandler() {
  const data = await getSpacesFromDB();
  return { data };
}

export async function createSpaceHandler(name: string, userId: string) {
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const data = await addSpaceToDB(name, userId);
  return { data };
}

export async function getSpaceHandler(id: string) {
  const data = await getSpaceFromDB(id);
  return { data: data[0] };
}
