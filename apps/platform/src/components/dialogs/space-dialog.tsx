"use client";

import { useState } from "react";
import { Button } from "@platform/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@platform/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@platform/components/ui/dropdown-menu";
import {
	EmojiPicker,
	EmojiPickerContent,
	EmojiPickerFooter,
	EmojiPickerSearch,
} from "@platform/components/ui/emoji-picker";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@platform/components/ui/field";
import { getFieldInvalid } from "@platform/components/ui/form-field";
import { Input } from "@platform/components/ui/input";
import { Textarea } from "@platform/components/ui/textarea";
import { trpcClient } from "@platform/integrations/tanstack-query/root-provider";
import { handleFormSubmit } from "@platform/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "@tanstack/react-form";
import { IconFolder, IconFolderPlus } from "@tabler/icons-react";
import { toast } from "sonner";
import { z } from "zod";

const spaceFormSchema = z.object({
	name: z.string().min(1, "Name is required"),
	description: z.string(),
	icon: z.string(),
});

type SpaceDialogProps = {
	mode: "create" | "update";
	open: boolean;
	onOpenChange: (open: boolean) => void;
	defaultValues?: {
		id: string;
		name: string;
		description?: string | null;
		icon?: string | null;
	};
	parentSpaceId?: string | null;
	trigger?: React.ReactNode;
};

const dialogConfig = {
	create: {
		title: "Create a new space",
		description: "Spaces help you organize your files and content.",
		submitText: "Create",
		loadingText: "Creating...",
	},
	update: {
		title: "Update space",
		description: "Update the details of this space.",
		submitText: "Save",
		loadingText: "Saving...",
	},
};

export default function SpaceDialog({
	mode,
	open,
	onOpenChange,
	defaultValues,
	parentSpaceId,
	trigger,
}: SpaceDialogProps) {
	const queryClient = useQueryClient();
	const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
	const config = dialogConfig[mode];

	const createMutation = useMutation({
		mutationFn: (data: { name: string; description?: string; icon?: string }) =>
			trpcClient.space.create.mutate({
				name: data.name,
				description: data.description,
				icon: data.icon,
				parentSpaceId: parentSpaceId,
			}),
		onSuccess: () => {
			toast.success("Space created successfully");
			onOpenChange(false);
			form.reset();
			if (parentSpaceId === null || parentSpaceId === undefined) {
				queryClient.invalidateQueries({ queryKey: ["spaces", "root"] });
			} else {
				queryClient.invalidateQueries({
					queryKey: ["spaces", "children", parentSpaceId],
				});
			}
		},
		onError: (error) => {
			toast.error(error.message || "Failed to create space");
		},
	});

	const updateMutation = useMutation({
		mutationFn: (data: { name: string; description?: string; icon?: string }) =>
			trpcClient.space.update.mutate({
				spaceId: defaultValues?.id ?? "",
				input: {
					name: data.name,
					description: data.description,
					icon: data.icon,
				},
			}),
		onSuccess: () => {
			toast.success("Space updated successfully");
			onOpenChange(false);
			queryClient.invalidateQueries({ queryKey: ["spaces"] });
		},
		onError: (error) => {
			toast.error(error.message || "Failed to update space");
		},
	});

	const form = useForm({
		defaultValues: {
			name: defaultValues?.name || "",
			description: defaultValues?.description || "",
			icon: defaultValues?.icon || "",
		},
		validators: {
			onChange: spaceFormSchema,
		},
		onSubmit: async ({ value }) => {
			const data = {
				name: value.name,
				description: value.description || undefined,
				icon: value.icon || undefined,
			};

			if (mode === "create") {
				createMutation.mutate(data);
			} else {
				updateMutation.mutate(data);
			}
		},
	});

	const isPending = createMutation.isPending || updateMutation.isPending;

	const handleOpenChange = (newOpen: boolean) => {
		if (!newOpen) {
			form.reset();
		}
		onOpenChange(newOpen);
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			{trigger !== undefined && (
				<DialogTrigger asChild>
					{trigger ? (
						trigger
					) : (
						<Button variant="outline" size="sm">
							<IconFolderPlus className="w-4 h-4" />
							New Space
						</Button>
					)}
				</DialogTrigger>
			)}
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{config.title}</DialogTitle>
					<DialogDescription>{config.description}</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleFormSubmit(() => form.handleSubmit())}>
					<FieldGroup className="py-4">
						<div className="flex gap-3 items-end">
							<form.Field
								name="icon"
								children={(field) => (
									<Field className="size-9">
										<FieldLabel className="sr-only">Icon</FieldLabel>
										<DropdownMenu
											open={emojiPickerOpen}
											onOpenChange={setEmojiPickerOpen}
										>
											<DropdownMenuTrigger asChild>
												<Button
													type="button"
													variant="outline"
													size="icon"
													className="h-9 w-9 shrink-0"
												>
													{field.state.value ? (
														<span className="text-lg">{field.state.value}</span>
													) : (
														<IconFolder className="w-4 h-4" />
													)}
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent
												className="p-0 border-none shadow-lg"
												align="start"
											>
												<EmojiPicker
													className="h-80"
													onEmojiSelect={(emoji) => {
														field.handleChange(emoji.emoji);
														setEmojiPickerOpen(false);
													}}
												>
													<EmojiPickerSearch placeholder="Search emoji..." />
													<EmojiPickerContent />
													<EmojiPickerFooter />
												</EmojiPicker>
											</DropdownMenuContent>
										</DropdownMenu>
									</Field>
								)}
							/>
							<form.Field
								name="name"
								children={(field) => {
									const isInvalid = getFieldInvalid(field);
									return (
										<Field data-invalid={isInvalid} className="flex-1">
											<FieldLabel htmlFor={field.name}>Name</FieldLabel>
											<Input
												id={field.name}
												name={field.name}
												type="text"
												placeholder="My Space"
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												onKeyDown={(e) => {
													if (e.key === "Enter") {
														e.preventDefault();
														form.handleSubmit();
													}
												}}
												aria-invalid={isInvalid}
											/>
											{isInvalid && (
												<FieldError errors={field.state.meta.errors} />
											)}
										</Field>
									);
								}}
							/>
						</div>
						<form.Field
							name="description"
							children={(field) => {
								const isInvalid = getFieldInvalid(field);
								return (
									<Field data-invalid={isInvalid}>
										<FieldLabel htmlFor={field.name}>Description</FieldLabel>
										<Textarea
											id={field.name}
											name={field.name}
											placeholder="What is this space for?"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											rows={3}
											aria-invalid={isInvalid}
										/>
										<FieldDescription>
											Add a description to help others understand this space.
										</FieldDescription>
										{isInvalid && (
											<FieldError errors={field.state.meta.errors} />
										)}
									</Field>
								);
							}}
						/>
					</FieldGroup>
					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => handleOpenChange(false)}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={isPending}>
							{isPending ? config.loadingText : config.submitText}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
