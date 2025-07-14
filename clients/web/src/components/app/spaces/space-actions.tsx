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

export default function SpaceActions({ space }: { space: Space | null }) {
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
        <DropdownMenuItem variant="destructive" className="cursor-pointer">
          <IconTrash /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
