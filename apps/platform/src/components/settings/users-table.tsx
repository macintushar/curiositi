"use client";

import type { ColumnDef } from "@tanstack/react-table";
import PaginatedTable, {
	DataTableColumnHeader,
} from "@platform/components/paginated-table";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@platform/components/ui/avatar";
import { Badge } from "@platform/components/ui/badge";
import { authClient } from "@platform/lib/auth-client";
import { Skeleton } from "@platform/components/ui/skeleton";
import { toast } from "sonner";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { MoreHorizontalIcon } from "lucide-react";
import { t } from "node_modules/nitro/dist/_dev.d.mts";

type Member = {
	id: string;
	organizationId: string;
	role: string;
	createdAt: Date;
	userId: string;
	user: {
		id: string;
		name: string | null;
		email: string;
		image: string | null;
	};
};

type User = {
	id: string;
	name: string | null;
	email: string;
	image: string | null;
	role: string;
	createdAt: Date;
};

const columns: ColumnDef<User>[] = [
	{
		accessorKey: "name",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Name" />
		),
		cell: ({ row }) => {
			const name = row.getValue<string>("name");
			const image = row.original.image;
			const email = row.original.email;
			return (
				<div className="flex items-center gap-3">
					<Avatar className="size-8">
						<AvatarImage src={image ?? undefined} alt={name ?? ""} />
						<AvatarFallback>
							{name?.charAt(0).toUpperCase() ?? email.charAt(0).toUpperCase()}
						</AvatarFallback>
					</Avatar>
					<div className="flex flex-col">
						<span className="font-medium">{name ?? "Unnamed"}</span>
						<span className="text-muted-foreground text-xs">{email}</span>
					</div>
				</div>
			);
		},
	},
	{
		accessorKey: "role",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Role" />
		),
		cell: ({ row }) => {
			const role = row.getValue<string>("role");
			return (
				<div className="flex justify-center items-center">
					<Badge>{role}</Badge>
				</div>
			);
		},
	},
	{
		accessorKey: "createdAt",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Joined" />
		),
		cell: ({ row }) => {
			const date = row.getValue<Date>("createdAt");
			return new Intl.DateTimeFormat("en-US", {
				dateStyle: "medium",
			}).format(date);
		},
	},
	{
		accessorKey: "actions",
		header: () => null,
		cell: ({ row }) => {
			const data = row.original;

			const handleRemoveUser = async () => {
				const hasPermission = await authClient.organization.hasPermission({
					permissions: {
						member: ["delete"],
					},
				});
				if (hasPermission.data?.success) {
					try {
						const res = await authClient.organization.removeMember({
							memberIdOrEmail: data.id,
						});
						if (res.error) {
							toast.error(res.error.message);
						} else {
							toast.success("User removed");
						}
					} catch (error) {
						toast.error(error instanceof Error ? error.message : String(error));
					}
				} else {
					toast.error("You do not have permission to remove this user");
				}
			};

			return (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size="icon-sm">
							<span className="sr-only">Open menu</span>
							<MoreHorizontalIcon className="size-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem onClick={handleRemoveUser} variant="destructive">
							Remove User
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			);
		},
	},
];

export default function UsersTable() {
	const { data: org, isPending } = authClient.useActiveOrganization();

	const users: User[] =
		(org?.members as Member[] | undefined)?.map((member) => ({
			id: member.id,
			name: member.user.name,
			email: member.user.email,
			image: member.user.image,
			role: member.role,
			createdAt: member.createdAt,
		})) ?? [];

	if (isPending) {
		return <Skeleton className="h-64" />;
	}

	return (
		<PaginatedTable
			columns={columns}
			data={users}
			showPagination
			showPageSize={false}
			showViewOptions
			showSearch
			searchColumn="name"
			searchPlaceholder="Search users..."
			emptyMessage="No users found."
			options={{
				initialState: {
					pagination: {
						pageIndex: 0,
						pageSize: 5,
					},
				},
			}}
		/>
	);
}

export type { User };
