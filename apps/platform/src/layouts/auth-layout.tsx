import { Image } from "@unpic/react";
import authHero from "@platform/assets/auth-hero.png";

export default function AuthLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="grid min-h-svh lg:grid-cols-2">
			<div className="flex flex-col gap-4 p-6 md:p-10">
				<div className="flex flex-1 items-center justify-center">
					<div className="w-full max-w-md">{children}</div>
				</div>
			</div>
			<div className="bg-muted relative hidden lg:block">
				<Image
					src={authHero}
					alt="Auth Hero"
					layout="fullWidth"
					className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
				/>
			</div>
		</div>
	);
}
