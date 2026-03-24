"use client";

import { useQueryClient } from "@tanstack/react-query";
import { ClockIcon, Briefcase } from "lucide-react";
import { useState } from "react";
import { authClient } from "@platform/lib/auth-client";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { toast } from "sonner";
import { Invitation } from ".";

dayjs.extend(relativeTime);


export function InvitationCard({ invitation }: { invitation: Invitation }) {
	const [isAccepting, setIsAccepting] = useState(false);
	const [isRejecting, setIsRejecting] = useState(false);
	const queryClient = useQueryClient();

	const roleLabel =
		invitation.role.charAt(0).toUpperCase() + invitation.role.slice(1);

	const handleAccept = async () => {
		setIsAccepting(true);
		const res = await authClient.organization.acceptInvitation({
			invitationId: invitation.id,
		});
		if (res.error) {
			toast.error(res.error.message);
		} else {
			toast.success("Invitation accepted");
			queryClient.invalidateQueries({ queryKey: ["invitations", "pending"] });
		}
		setIsAccepting(false);
	};

	const handleReject = async () => {
		setIsRejecting(true);
		const res = await authClient.organization.rejectInvitation({
			invitationId: invitation.id,
		});
		if (res.error) {
			toast.error(res.error.message);
		} else {
			toast.success("Invitation rejected");
			queryClient.invalidateQueries({ queryKey: ["invitations", "pending"] });
		}
		setIsRejecting(false);
	};

	return (
		<Card>
			<CardContent>
				<div className="flex items-start justify-between gap-4">
					<div className="flex items-start gap-4 flex-1 min-w-0">
						<div className="flex items-center justify-center w-11 h-11 rounded-xl border border-primary/10">
							<Briefcase className="w-5 h-5 text-primary" />
						</div>

						<div className="flex-1 min-w-0">
							<div className="flex items-center gap-2 mb-1">
								<h3 className="font-semibold text-foreground truncate">
									{invitation.organizationName}
								</h3>
								<span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-primary/10 text-primary">
									{roleLabel}
								</span>
							</div>

							<div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
								<div className="flex items-center gap-1.5">
									<ClockIcon className="w-3 h-3" />
									<span>{dayjs(invitation.createdAt).fromNow()}</span>
								</div>
								<div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
							</div>
						</div>
						<div className="flex gap-2">
							<Button
								variant="outline"
								size="sm"
								onClick={handleReject}
								disabled={isRejecting || isAccepting}
							>
								{isRejecting ? "Rejecting..." : "Reject"}
							</Button>
							<Button
								variant="default"
								size="sm"
								onClick={handleAccept}
								disabled={isAccepting || isRejecting}
							>
								{isAccepting ? "Joining..." : "Join"}
							</Button>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
