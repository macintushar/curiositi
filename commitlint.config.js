export default {
	extends: ["@commitlint/config-conventional"],
	rules: {
		"type-enum": [
			2,
			"always",
			[
				"feat",
				"fix",
				"docs",
				"chore",
				"style",
				"refactor",
				"ci",
				"test",
				"revert",
				"perf",
			],
		],
		"scope-enum": [
			2,
			"always",
			["platform", "worker", "db", "share", "queue", "api"],
		],
	},
};
