import fs from "node:fs";
import { execSync } from "node:child_process";

// Type definitions
type BumpType = "major" | "minor" | "patch";
interface Change {
	packages: string[];
	bump: BumpType;
	desc: string;
	hash: string;
}

// Map scopes to packages
const SCOPE_MAP: Record<string, string> = {
	platform: "@curiositi/platform",
	worker: "@curiositi/worker",
	db: "@curiositi/db",
	queue: "@curiositi/queue",
	share: "@curiositi/share",
	api: "@curiositi/api-handlers",
};

// Helper to get commits since last tag
function getNewCommits(): string[] {
	try {
		const lastTag = execSync("git describe --tags --abbrev=0 2>/dev/null")
			.toString()
			.trim();
		return execSync(`git log ${lastTag}..HEAD --pretty=format:"%H<|>%s<|>%b"`)
			.toString()
			.split("\n");
	} catch (_e) {
		// If no tags, get all commits
		return execSync('git log --pretty=format:"%H<|>%s<|>%b"')
			.toString()
			.split("\n");
	}
}

const commits = getNewCommits();
const changes: Change[] = [];

for (const line of commits) {
	if (!line) continue;
	const [hash, msg, body] = line.split("<|>");

	// Regex to match: type(scope)!: message OR type!: message OR type(scope): message
	// Captures: 1=type, 2=scope (optional), 3=! (optional), 4=message
	const match = msg.match(
		/^(feat|fix|perf|refactor|chore|style|test|docs|ci|revert)(?:\((.+)\))?(!?): (.+)$/
	);

	if (match) {
		const type = match[1];
		const scope = match[2];
		const breakingMark = match[3];
		const desc = match[4];

		// Determine Bump Type
		let bump: BumpType = "patch";
		if (type === "feat") bump = "minor";
		if (breakingMark === "!" || body?.includes("BREAKING CHANGE:")) {
			bump = "major";
		}

		// Determine Packages
		const packages: string[] = [];
		if (scope && SCOPE_MAP[scope]) {
			packages.push(SCOPE_MAP[scope]);
		} else {
			// If no scope or unknown scope, we generally don't want to release random things.
			// However, to be safe, we can log a warning.
			console.warn(
				`[WARN] Commit ${hash.substring(0, 7)} has unknown or missing scope: "${scope || "none"}". Skipped.`
			);
			continue;
		}

		if (packages.length > 0) {
			changes.push({ packages, bump, desc, hash });
		}
	}
}

// Generate Changeset Files
if (changes.length > 0) {
	console.log(`Found ${changes.length} relevant commits.`);
	changes.forEach((change) => {
		const fileName = `.changeset/auto-generate-${change.hash.substring(0, 7)}.md`;
		const content = `---\n${change.packages.map((p) => `"${p}": ${change.bump}`).join("\n")}\n---\n\n${change.desc}\n`;
		fs.writeFileSync(fileName, content);
	});
} else {
	console.log("No new relevant commits found.");
}
