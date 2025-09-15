import { SUPPORTED_FILE_TYPES } from "@/constants";
import models from "@/models-list";
import { Configs } from "@/types";

export async function getConfigs(): Promise<Configs> {
  return {
    providers: [...models],
    file_types: SUPPORTED_FILE_TYPES,
  };
}
