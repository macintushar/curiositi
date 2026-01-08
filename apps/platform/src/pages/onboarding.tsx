import OrganizationForm from "@platform/forms/organization";
import { Button } from "@platform/components/ui/button";
import { authClient } from "@platform/lib/auth-client";
import { Navigate } from "@tanstack/react-router";

import { useState } from "react";

type BaseStepProps = {
	handleNextStep: () => void;
};

function StepOne({ name, handleNextStep }: { name: string } & BaseStepProps) {
	return (
		<div className="h-full w-full flex flex-col gap-8 items-center justify-center">
			<h1 className="text-6xl font-bold">
				👋 Hey,{" "}
				<span className="text-accent-foreground font-serif">{name}</span>
			</h1>
			<p className="text-xl font-semibold">
				Welcome to Curiositi! Let's get started.
			</p>
			<Button onClick={handleNextStep}>Get Started →</Button>
		</div>
	);
}

function StepTwo({
	userId,
	handleNextStep,
}: { userId: string } & BaseStepProps) {
	return (
		<div className="h-full w-full flex flex-col gap-8 items-center justify-center">
			<div className="max-w-xl w-full h-full flex flex-col gap-8 items-center justify-center">
				<h1 className="text-4xl font-bold">Let's create a new workspace!</h1>
				<p className="text-xl text-center">
					Workspaces are the best way to organize your files and share them with
					anyone.
				</p>

				<OrganizationForm
					userId={userId}
					mode="create"
					nextStep={handleNextStep}
				/>
			</div>
		</div>
	);
}

function StepThree({ handleNextStep }: BaseStepProps) {
	return (
		<div className="h-full w-full flex flex-col gap-8 items-center justify-center">
			<div className="max-w-xl w-full h-full flex flex-col gap-8 items-center justify-center">
				<h1 className="text-6xl font-bold">🎉 You're all set! 🎉</h1>
				<p className="text-3xl font-semibold text-center">
					Welcome to Curiositi!
				</p>
				<Button onClick={handleNextStep}>Jump In!</Button>
			</div>
		</div>
	);
}

export default function Onboarding() {
	const session = authClient.useSession();
	const [step, setStep] = useState<number>(1);

	return (
		<div className="flex min-h-svh max-h-svh min-w-svw max-w-svw w-svw h-svh flex-col p-4 bg-accent">
			{step === 1 && (
				<StepOne
					name={session.data?.user?.name || ""}
					handleNextStep={() => setStep(2)}
				/>
			)}
			{step === 2 && (
				<StepTwo
					handleNextStep={() => setStep(3)}
					userId={session.data?.user.id || ""}
				/>
			)}
			{step === 3 && <StepThree handleNextStep={() => setStep(4)} />}

			{step === 4 && <Navigate to="/app" />}
		</div>
	);
}
