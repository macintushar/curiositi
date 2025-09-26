"use client";

import { toast } from "sonner";
import CreateSpaceDialog from "./create-space";
import { Button } from "@/components/ui/button";
import { IconDotsVertical, IconEdit, IconTrash } from "@tabler/icons-react";
import type { Space } from "@/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDeleteSpace } from "@/hooks/use-spaces";
import { useRouter } from "next/navigation";
import { updateSpace } from "@/services/spaces";

export default function SpaceActions({
  space,
  refetch,
}: {
  space: Space | null;
  refetch: () => void;
}) {
  const router = useRouter();
  const deleteSpaceMutation = useDeleteSpace();

  if (!space) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <IconDotsVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <CreateSpaceDialog
          handleSubmit={async (values) => {
            try {
              const { data, error } = await updateSpace(
                space.id,
                values.name,
                values.icon,
                values.description,
              );
              if (error) {
                return { success: false, error: error.message };
              }
              if (data) {
                void refetch();
                return { success: true, message: "Space updated successfully" };
              }
            } catch (error) {
              const message =
                error instanceof Error ? error.message : String(error);
              return { success: false, error: message };
            }
            return { success: false, error: "Unknown error occurred" };
          }}
          title="Update space"
          ctaText="Update"
          values={{
            name: space.name ?? "",
            icon: space.icon ?? "",
            description: space.description ?? "",
          }}
          trigger={
            <DropdownMenuItem
              className="cursor-pointer"
              onSelect={(e) => e.preventDefault()}
            >
              <IconEdit /> Edit
            </DropdownMenuItem>
          }
        />
        <DropdownMenuItem
          variant="destructive"
          className="cursor-pointer"
          onClick={() => {
            deleteSpaceMutation.mutate(space.id, {
              onSuccess: () => {
                toast.success("Space deleted successfully");
                router.push("/app/spaces");
              },
              onError: (error) => {
                toast.error(error.message ?? "Error deleting space");
              },
            });
          }}
          disabled={deleteSpaceMutation.isPending}
        >
          <IconTrash />{" "}
          {deleteSpaceMutation.isPending ? "Deleting..." : "Delete"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
