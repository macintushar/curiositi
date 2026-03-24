"use client";

import type { ColumnDef } from "@tanstack/react-table";
import PaginatedTable, {
	DataTableColumnHeader,
} from "@platform/components/paginated-table";
import { Badge } from "@platform/components/ui/badge";
import { Button } from "@platform/components/ui/button";
import { authClient } from "@platform/lib/auth-client";
import { Skeleton } from "@platform/components/ui/skeleton";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@platform/components/ui/dropdown-menu";
import { MoreHorizontalIcon } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import type { InvitationStatus } from "better-auth/plugins";

type Invitation = {
	id: string;
	email: string;
	role: string;
	createdAt: Date;
	status: InvitationStatus;
};

const columns: ColumnDef<Invitation>[] = [
	{
		accessorKey: "email",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Email" />
		),
	},
	{
		accessorKey: "role",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Role" />
		),
		cell: ({ row }) => {
			const role = row.getValue<string>("role");
			return <Badge variant="secondary">{role}</Badge>;
		},
	},
	{
		accessorKey: "status",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Status" />
		),
		cell: ({ row }) => {
			const status = row.getValue<string>("status");
			return (
				<Badge variant={status === "pending" ? "outline" : "default"}>
					{status}
				</Badge>
			);
		},
	},
	{
		accessorKey: "createdAt",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Invited" />
		),
		cell: ({ row }) => {
			const date = row.getValue<Date>("createdAt");
			return new Intl.DateTimeFormat("en-US", {
				dateStyle: "medium",
			}).format(date);
		},
	},
	{
		id: "actions",
		cell: ({ row }) => {
			const invitation = row.original;

			const handleCancel = async () => {
				const res = await authClient.organization.cancelInvitation({
					invitationId: invitation.id,
				});
				if (res.error) {
					toast.error(res.error.message);
				} else {
					toast.success("Invitation cancelled");
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
						<DropdownMenuItem onClick={handleCancel} variant="destructive">
							Cancel invitation
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			);
		},
	},
];

export default function InvitedUsers() {
	const { data: queryData, isPending } = useQuery({
		queryKey: ["invitations"],
		queryFn: async () => await authClient.organization.listInvitations(),
	});

	const invitations: Invitation[] =
		queryData?.data
			?.map((invitation) => ({
				id: invitation.id,
				email: invitation.email,
				role: invitation.role,
				createdAt: invitation.createdAt,
				status: invitation.status,
			}))
			.filter((val) => val.status !== "accepted") ?? [];

	if (isPending) {
		return <Skeleton className="h-64" />;
	}

	return (
		<PaginatedTable
			columns={columns}
			data={invitations}
			showPagination
			showPageSize={false}
			showViewOptions
			showSearch
			searchColumn="email"
			searchPlaceholder="Search invitations..."
			emptyMessage="No pending invitations."
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
