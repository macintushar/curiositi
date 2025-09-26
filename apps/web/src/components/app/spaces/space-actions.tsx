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

export default function SpaceActions({ space }: { space: Space | null }) {
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
          handleSubmit={async () => {
            toast.success("Space updated successfully");
            return { success: true, message: "Space updated successfully" };
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
