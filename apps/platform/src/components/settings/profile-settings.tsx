import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import SettingsLayout, { ActionCard, LayoutHead } from "./settings-layout";
import { authClient } from "@platform/lib/auth-client";
import { Button } from "../ui/button";
import { ProfileForm } from "@platform/forms/profile";
import { IconBrandGoogleFilled } from "@tabler/icons-react";
import type { SocialProviderList } from "better-auth";
import { useRef, useState } from "react";

export default function ProfileSettings() {
	const [isLinking, setIsLinking] = useState(false);
	const { data: user } = authClient.useSession();
	const fileInputRef = useRef<HTMLInputElement>(null);
	if (!user) return null;

	async function linkSocials(provider: SocialProviderList[1]) {
		setIsLinking(true);
		try {
			await authClient.linkSocial({ provider });
		} finally {
			setIsLinking(false);
		}
	}

	async function uploadAvatar(file: File) {
		setIsLinking(true);
		const reader = new FileReader();
		reader.onload = async () => {
			const dataUrl = reader.result as string;
			try {
				await authClient.updateUser({ image: dataUrl });
			} finally {
				setIsLinking(false);
			}
		};
		reader.readAsDataURL(file);
	}

	function handleAvatarUpload(event: React.ChangeEvent<HTMLInputElement>) {
		const file = event.target.files?.[0];
		if (file) {
			uploadAvatar(file);
		}
	}

	return (
		<SettingsLayout title="Profile Settings" description="Update your profile">
			<div>
				<ActionCard>
					<div className="flex items-start justify-between">
						<LayoutHead
							title="Update your avatar"
							description="Click on the avatar to update it"
						/>
						<input
							ref={fileInputRef}
							type="file"
							accept="image/*"
							className="hidden"
							onChange={handleAvatarUpload}
						/>
						<Avatar
							className="size-24 cursor-pointer"
							onClick={() => fileInputRef.current?.click()}
						>
							<AvatarImage src={user?.user.image ?? ""} alt={user?.user.name} />
							<AvatarFallback className="bg-background/30 border">
								{user?.user.name?.[0]}
							</AvatarFallback>
						</Avatar>
					</div>
				</ActionCard>
				<ActionCard>
					<div className="flex flex-col items-start justify-between">
						<LayoutHead
							title="Display Name"
							description="Please enter your full name, or a display name you are comfortable with."
						/>
						<ProfileForm defaultValues={{ name: user?.user.name }} />
					</div>
				</ActionCard>
				<ActionCard>
					<div className="flex flex-col items-start justify-between">
						<LayoutHead
							title="Link your accounts"
							description="Link your accounts to Curiositi"
						/>
						<div className="flex gap-2 justify-center items-center w-full">
							<Button
								variant="outline"
								onClick={() => linkSocials("google")}
								disabled={isLinking}
							>
								{isLinking ? (
									"Linking..."
								) : (
									<>
										<IconBrandGoogleFilled /> Link to Google
									</>
								)}
							</Button>
						</div>
					</div>
				</ActionCard>
			</div>
		</SettingsLayout>
	);
}
