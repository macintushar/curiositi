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
		return execSync(`git log ${lastTag}..HEAD --pretty=format:"%H|%s"`)
			.toString()
			.split("\n");
	} catch (_e) {
		// If no tags, get all commits
		return execSync('git log --pretty=format:"%H|%s"').toString().split("\n");
	}
}

const commits = getNewCommits();
const changes: Change[] = [];

for (const line of commits) {
	if (!line) continue;
	const [hash, msg] = line.split("|");
	const match = msg.match(/^(feat|fix|perf|refactor)(?:\((.+)\))?: (.+)$/);

	if (match) {
		const type = match[1];
		const scope = match[2];
		const desc = match[3];

		// Determine Bump Type
		let bump: BumpType = "patch";
		if (type === "feat") bump = "minor";
		if (msg.includes("BREAKING CHANGE")) bump = "major";

		// Determine Packages
		const packages: string[] = [];
		if (scope && SCOPE_MAP[scope]) {
			packages.push(SCOPE_MAP[scope]);
		} else {
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
