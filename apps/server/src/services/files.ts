import {
  getFilesFromDB,
  getFileFromDB,
  deleteFileFromDB,
  getAllUsersFilesFromDB,
} from "@/services/queries";

export async function getFilesHandler(space_id: string) {
  const files = await getFilesFromDB(space_id);
  return { data: files };
}

export async function getAllFilesHandler(user_id: string) {
  const files = await getAllUsersFilesFromDB(user_id);
  return { data: files };
}

export async function getFileHandler(id: string, space_id: string) {
  const fileResult = await getFileFromDB(id, space_id);

  if (fileResult.length === 0) {
    throw new Error("File not found");
  }

  const file = fileResult[0];
  return {
    contentType: file.type,
    fileName: file.name,
    data: file.file,
  };
}

export async function deleteFileHandler(id: string, space_id: string) {
  const deletedFile = await deleteFileFromDB(id, space_id);

  if (!deletedFile) {
    throw new Error("File not found");
  }

  return { message: "File deleted successfully" };
}
