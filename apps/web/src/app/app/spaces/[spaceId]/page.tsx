"use client";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

import FileItem from "@/components/app/spaces/file-item";
import UploadFile from "@/components/app/spaces/upload-file";
import SpaceActions from "@/components/app/spaces/space-actions";

import type { ApiResponse, MessageResponse } from "@/types";
import GlobalError from "@/app/global-error";
import { useDeleteFile, useFilesInSpace, useSpace } from "@/hooks/use-spaces";
import { use } from "react";

import { getFile } from "@/services/spaces";

export default function Space({
  params,
}: {
  params: Promise<{ spaceId: string }>;
}) {
  const { spaceId } = use(params);
  const { data, error, refetch, isPending } = useSpace(spaceId);
  const {
    data: files,
    error: filesError,
    isPending: filesPending,
    refetch: refetchFiles,
  } = useFilesInSpace(spaceId);
  const deleteFileMutation = useDeleteFile();

  if (error || filesError) {
    return (
      <GlobalError
        error={
          error || filesError
            ? new Error(`Error: ${error?.message} ${filesError?.message}`)
            : new Error("Unknown error occurred")
        }
      />
    );
  }

  if (
    data?.error ||
    (files?.error && !filesPending) ||
    (!data?.data?.space && !isPending)
  ) {
    return (
      <div>
        Error: {data?.error}
        {files?.error}
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col items-center justify-start p-4">
      <div className="flex h-full w-full flex-col gap-4 md:w-2/3 md:pt-40">
        <div className="flex items-center justify-between">
          <div className="flex gap-4 text-3xl font-medium">
            {isPending ? (
              <div className="bg-muted h-8 w-xs animate-pulse" />
            ) : (
              <h1>
                {data?.data.space.icon} {data?.data.space.name}
              </h1>
            )}
          </div>

          <SpaceActions space={data?.data?.space ?? null} refetch={refetch} />
        </div>
        <div className="flex max-h-full min-h-0 flex-1 flex-col gap-6">
          <UploadFile
            spaceId={spaceId}
            areFilesInSpace={(files?.data && files.data.length > 0) ?? false}
            refetch={refetchFiles}
          />
          <ScrollArea className="flex h-full max-h-full w-full flex-1 flex-col">
            {files?.data.map((fileItem) => (
              <FileItem
                file={fileItem}
                handleGetFile={async () => {
                  const result = await getFile(spaceId, fileItem.id);

                  if (result.error) {
                    return {
                      data: null,
                      error: result.error.message || "Error downloading file",
                    };
                  }

                  if (result.data) {
                    // Convert Response to Blob for client-side usage
                    const blob = await (
                      result.data as unknown as Response
                    ).blob();
                    return { data: blob, error: null };
                  }

                  return { data: null, error: "No file data received" };
                }}
                handleDeleteFile={async () => {
                  return new Promise((resolve) => {
                    deleteFileMutation.mutate(
                      { spaceId, fileId: fileItem.id },
                      {
                        onSuccess: (data) => {
                          resolve({
                            data: data,
                            error: null,
                          } as ApiResponse<MessageResponse>);
                        },
                        onError: (error) => {
                          resolve({
                            data: null,
                            error: error,
                          } as unknown as ApiResponse<MessageResponse>);
                        },
                      },
                    );
                  });
                }}
                key={fileItem.id}
              />
            ))}
            <ScrollBar orientation="vertical" />
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
