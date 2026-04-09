import { relations } from "drizzle-orm";
import {
	type AnyPgColumn,
	boolean,
	index,
	pgEnum,
	pgTable,
	pgTableCreator,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import {
	selectSpaceSchema,
	createSpaceSchema,
	selectFileSchema,
	createFileSchema,
} from "@curiositi/share/db-schemas";

export const createTable = pgTableCreator((name) => `curiositi_${name}`);

/////////////////////////////////////////////////////////////
//                                                         //
//				Drizzle Schemas - Auto Generated           //
//                                                         //
/////////////////////////////////////////////////////////////

export const user = pgTable(
	"user",
	{
		id: text("id").primaryKey(),
		name: text("name").notNull(),
		email: text("email").notNull().unique(),
		emailVerified: boolean("email_verified")
			.$defaultFn(() => false)
			.notNull(),
		image: text("image"),
		lastLoginMethod: text("last_login_method"),
		createdAt: timestamp("created_at")
			.$defaultFn(() => new Date())
			.notNull(),
		updatedAt: timestamp("updated_at")
			.$defaultFn(() => new Date())
			.notNull(),
	},
	(t) => [index("user_email_idx").on(t.email)]
);

export const session = pgTable(
	"session",
	{
		id: text("id").primaryKey(),
		expiresAt: timestamp("expires_at").notNull(),
		token: text("token").notNull().unique(),
		createdAt: timestamp("created_at").notNull(),
		updatedAt: timestamp("updated_at").notNull(),
		ipAddress: text("ip_address"),
		userAgent: text("user_agent"),
		activeOrganizationId: text("active_organization_id").references(
			() => organization.id
		),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
	},
	(t) => [
		index("session_user_id_idx").on(t.userId),
		index("session_token_idx").on(t.token),
	]
);

export const account = pgTable(
	"account",
	{
		id: text("id").primaryKey(),
		accountId: text("account_id").notNull(),
		providerId: text("provider_id").notNull(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		accessToken: text("access_token"),
		refreshToken: text("refresh_token"),
		idToken: text("id_token"),
		accessTokenExpiresAt: timestamp("access_token_expires_at"),
		refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
		scope: text("scope"),
		password: text("password"),
		createdAt: timestamp("created_at").notNull(),
		updatedAt: timestamp("updated_at").notNull(),
	},
	(t) => [
		index("account_user_id_idx").on(t.userId),
		index("account_provider_idx").on(t.providerId, t.accountId),
	]
);

export const verification = pgTable(
	"verification",
	{
		id: text("id").primaryKey(),
		identifier: text("identifier").notNull(),
		value: text("value").notNull(),
		expiresAt: timestamp("expires_at").notNull(),
		createdAt: timestamp("created_at").$defaultFn(() => new Date()),
		updatedAt: timestamp("updated_at").$defaultFn(() => new Date()),
	},
	(t) => [index("verification_identifier_idx").on(t.identifier)]
);

export const organization = pgTable(
	"organization",
	{
		id: text("id").primaryKey(),
		name: text("name").notNull(),
		slug: text("slug").notNull().unique(),
		logo: text("logo"),
		metadata: text("metadata"),
		createdAt: timestamp("created_at")
			.$defaultFn(() => new Date())
			.notNull(),
	},
	(t) => [index("organization_slug_idx").on(t.slug)]
);

export const member = pgTable(
	"member",
	{
		id: text("id").primaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organization.id, { onDelete: "cascade" }),
		role: text("role").notNull(),
		createdAt: timestamp("created_at")
			.$defaultFn(() => new Date())
			.notNull(),
	},
	(t) => [
		index("member_user_id_idx").on(t.userId),
		index("member_organization_id_idx").on(t.organizationId),
	]
);

export const invitation = pgTable(
	"invitation",
	{
		id: text("id").primaryKey(),
		email: text("email").notNull(),
		inviterId: text("inviter_id")
			.notNull()
			.references(() => user.id),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organization.id, { onDelete: "cascade" }),
		role: text("role").notNull(),
		status: text("status").notNull(),
		createdAt: timestamp("created_at")
			.$defaultFn(() => new Date())
			.notNull(),
		expiresAt: timestamp("expires_at")
			.$defaultFn(() => new Date())
			.notNull(),
	},
	(t) => [
		index("invitation_email_idx").on(t.email),
		index("invitation_organization_id_idx").on(t.organizationId),
	]
);

export const organizationRoles = pgTable(
	"organization_roles",
	{
		id: text("id").primaryKey(),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organization.id, { onDelete: "cascade" }),
		role: text("role").notNull(),
		permission: text("permission").notNull(),
		createdAt: timestamp("created_at")
			.$defaultFn(() => new Date())
			.notNull(),
		updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
	},
	(t) => [index("organization_roles_org_id_idx").on(t.organizationId)]
);

// Relations
export const userRelations = relations(user, ({ many }) => ({
	accounts: many(account),
	sessions: many(session),
	members: many(member),
	invitationsSent: many(invitation),
	filesUploaded: many(files, { relationName: "uploadedBy" }),
	agentsCreated: many(agents, { relationName: "createdBy" }),
	conversationsCreated: many(conversations, { relationName: "createdBy" }),
}));

export const accountRelations = relations(account, ({ one }) => ({
	user: one(user, { fields: [account.userId], references: [user.id] }),
}));

export const sessionRelations = relations(session, ({ one }) => ({
	user: one(user, { fields: [session.userId], references: [user.id] }),
	organization: one(organization, {
		fields: [session.activeOrganizationId],
		references: [organization.id],
	}),
}));

export const organizationRelations = relations(organization, ({ many }) => ({
	members: many(member),
	invitations: many(invitation),
	roles: many(organizationRoles),
	spaces: many(spaces),
	files: many(files),
	tools: many(tools),
	agents: many(agents),
	conversations: many(conversations),
	mcpServers: many(mcpServers),
	settings: many(organizationSettings),
}));

export const memberRelations = relations(member, ({ one }) => ({
	user: one(user, { fields: [member.userId], references: [user.id] }),
	organization: one(organization, {
		fields: [member.organizationId],
		references: [organization.id],
	}),
}));

export const invitationRelations = relations(invitation, ({ one }) => ({
	inviter: one(user, { fields: [invitation.inviterId], references: [user.id] }),
	organization: one(organization, {
		fields: [invitation.organizationId],
		references: [organization.id],
	}),
}));

export const organizationRolesRelations = relations(
	organizationRoles,
	({ one }) => ({
		organization: one(organization, {
			fields: [organizationRoles.organizationId],
			references: [organization.id],
		}),
	})
);

/////////////////////////////////////////////////////////////
//                                                         //
//					Curiositi Schemas           		   //
//                                                         //
/////////////////////////////////////////////////////////////

export const spaces = createTable(
	"spaces",
	(d) => ({
		id: d.uuid().primaryKey().defaultRandom(),
		name: d.text().notNull(),
		description: d.text(),
		icon: d.text(),
		organizationId: d
			.text()
			.notNull()
			.references(() => organization.id),
		parentSpaceId: d
			.uuid()
			.references((): AnyPgColumn => spaces.id, { onDelete: "cascade" }),
		createdAt: d
			.timestamp({ withTimezone: true })
			.$defaultFn(() => new Date())
			.notNull(),
		updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
	}),
	(t) => [
		index("space_id_idx").on(t.id),
		index("space_organization_id_idx").on(t.organizationId),
	]
);

// Re-export schemas from share package for consistency
export { selectSpaceSchema, createSpaceSchema };

export const fileStatusEnum = pgEnum("file_status", [
	"pending",
	"processing",
	"completed",
	"failed",
]);

export const files = createTable(
	"files",
	(d) => ({
		id: d.uuid().primaryKey().defaultRandom(),
		name: d.text().notNull(),
		path: d.text().notNull(),
		size: d.integer().notNull(),
		type: d.text().notNull(),
		organizationId: d
			.text()
			.notNull()
			.references(() => organization.id),
		uploadedById: d
			.text()
			.notNull()
			.references(() => user.id),
		status: fileStatusEnum().default("pending").notNull(),
		tags: d.jsonb().default({ tags: [] }),
		processedAt: d.timestamp({ withTimezone: true }),
		createdAt: d
			.timestamp({ withTimezone: true })
			.$defaultFn(() => new Date())
			.notNull(),
		updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
	}),
	(t) => [
		index("uploaded_by_idx").on(t.uploadedById),
		index("organization_idx").on(t.organizationId),
		index("name_idx").on(t.name),
	]
);

// Re-export schemas from share package for consistency
export { selectFileSchema, createFileSchema };

export const fileContents = createTable(
	"file_contents",
	(d) => ({
		id: d.uuid().primaryKey().defaultRandom(),
		fileId: d
			.uuid()
			.notNull()
			.references(() => files.id, { onDelete: "cascade" }),
		content: d.text().notNull(),
		embeddedContent: d.vector({ dimensions: 1536 }).notNull(),
		metadata: d.json(),
		createdAt: d
			.timestamp({ withTimezone: true })
			.$defaultFn(() => new Date())
			.notNull(),
		updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
	}),
	(t) => [index("file_idx").on(t.fileId), index("content_idx").on(t.content)]
);

export const filesInSpace = createTable(
	"files_in_space",
	(d) => ({
		id: d.uuid().primaryKey().defaultRandom(),
		fileId: d
			.uuid()
			.notNull()
			.references(() => files.id, { onDelete: "cascade" }),
		spaceId: d
			.uuid()
			.notNull()
			.references(() => spaces.id, { onDelete: "cascade" }),
		createdAt: d
			.timestamp({ withTimezone: true })
			.$defaultFn(() => new Date())
			.notNull(),
		updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
	}),
	(t) => [index("space_idx").on(t.spaceId)]
);

export const filesInSpaceRelations = relations(filesInSpace, ({ one }) => ({
	file: one(files, { fields: [filesInSpace.fileId], references: [files.id] }),
	space: one(spaces, {
		fields: [filesInSpace.spaceId],
		references: [spaces.id],
	}),
}));

export const spacesRelations = relations(spaces, ({ one, many }) => ({
	organization: one(organization, {
		fields: [spaces.organizationId],
		references: [organization.id],
	}),
	parentSpace: one(spaces, {
		fields: [spaces.parentSpaceId],
		references: [spaces.id],
		relationName: "parentSpace",
	}),
	childSpaces: many(spaces, { relationName: "parentSpace" }),
	filesInSpace: many(filesInSpace),
}));

export const filesRelations = relations(files, ({ one, many }) => ({
	organization: one(organization, {
		fields: [files.organizationId],
		references: [organization.id],
	}),
	uploadedBy: one(user, {
		fields: [files.uploadedById],
		references: [user.id],
	}),
	contents: many(fileContents),
	filesInSpace: many(filesInSpace),
}));

export const fileContentsRelations = relations(fileContents, ({ one }) => ({
	file: one(files, { fields: [fileContents.fileId], references: [files.id] }),
}));

///////////////////////////////////////////////////////////
//                                                         //
//					Agent Schemas               		  //
//                                                         //
///////////////////////////////////////////////////////////

export const modelProviderEnum = pgEnum("model_provider", [
	"openai",
	"google",
	"anthropic",
	"ollama",
]);

export const toolTypeEnum = pgEnum("tool_type", ["builtin", "mcp"]);

export const searchProviderEnum = pgEnum("search_provider", [
	"firecrawl",
	"exa",
	"webfetch",
]);

export const tools = createTable(
	"tools",
	(d) => ({
		id: d.uuid().primaryKey().defaultRandom(),
		toolKey: d.text(),
		name: d.text().notNull(),
		displayName: d.text().notNull(),
		description: d.text().notNull(),
		type: toolTypeEnum().notNull().default("builtin"),
		mcpServerId: d.uuid().references(() => mcpServers.id),
		organizationId: d
			.text()
			.notNull()
			.references(() => organization.id),
		config: d.jsonb().notNull().default({}),
		isActive: d.boolean().default(true).notNull(),
		createdAt: d
			.timestamp({ withTimezone: true })
			.$defaultFn(() => new Date())
			.notNull(),
		updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
	}),
	(t) => [
		index("tool_organization_idx").on(t.organizationId),
		index("tool_name_idx").on(t.name),
		index("tool_key_idx").on(t.toolKey),
	]
);

export const agents = createTable(
	"agents",
	(d) => ({
		id: d.uuid().primaryKey().defaultRandom(),
		name: d.text().notNull(),
		description: d.text(),
		organizationId: d
			.text()
			.notNull()
			.references(() => organization.id),
		createdById: d.text().references(() => user.id),
		systemPrompt: d.text().notNull(),
		maxToolCalls: d.integer().default(10).notNull(),
		isDefault: d.boolean().default(false).notNull(),
		isActive: d.boolean().default(true).notNull(),
		createdAt: d
			.timestamp({ withTimezone: true })
			.$defaultFn(() => new Date())
			.notNull(),
		updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
	}),
	(t) => [
		index("agent_organization_idx").on(t.organizationId),
		index("agent_created_by_idx").on(t.createdById),
	]
);

export const agentTools = createTable(
	"agent_tools",
	(d) => ({
		id: d.uuid().primaryKey().defaultRandom(),
		agentId: d
			.uuid()
			.notNull()
			.references(() => agents.id, { onDelete: "cascade" }),
		toolId: d
			.uuid()
			.notNull()
			.references(() => tools.id, { onDelete: "cascade" }),
		enabled: d.boolean().default(true).notNull(),
		priority: d.integer().default(0).notNull(),
		config: d.jsonb().default({}),
		createdAt: d
			.timestamp({ withTimezone: true })
			.$defaultFn(() => new Date())
			.notNull(),
	}),
	(t) => [
		index("agent_tool_agent_idx").on(t.agentId),
		index("agent_tool_tool_idx").on(t.toolId),
	]
);

export const conversationSourceEnum = pgEnum("conversation_source", [
	"web",
	"slack",
]);

export const conversations = createTable(
	"conversations",
	(d) => ({
		id: d.uuid().primaryKey().defaultRandom(),
		externalId: d.text().unique(),
		title: d.text(),
		source: conversationSourceEnum().notNull(),
		organizationId: d
			.text()
			.notNull()
			.references(() => organization.id),
		createdById: d
			.text()
			.notNull()
			.references(() => user.id),
		metadata: d.jsonb(),
		createdAt: d
			.timestamp({ withTimezone: true })
			.$defaultFn(() => new Date())
			.notNull(),
		updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
	}),
	(t) => [
		index("conversation_organization_idx").on(t.organizationId),
		index("conversation_external_idx").on(t.externalId),
	]
);

export const messageRoleEnum = pgEnum("message_role", [
	"user",
	"assistant",
	"system",
	"tool",
]);

export const messages = createTable(
	"messages",
	(d) => ({
		id: d.uuid().primaryKey().defaultRandom(),
		conversationId: d
			.uuid()
			.notNull()
			.references(() => conversations.id, { onDelete: "cascade" }),
		role: messageRoleEnum().notNull(),
		content: d.text().notNull(),
		attachments: d.jsonb(),
		toolCalls: d.jsonb(),
		tokenCount: d.integer(),
		costUSD: d.real(),
		agentId: d.uuid().references(() => agents.id, { onDelete: "set null" }),
		metadata: d.jsonb(),
		createdAt: d
			.timestamp({ withTimezone: true })
			.$defaultFn(() => new Date())
			.notNull(),
	}),
	(t) => [
		index("message_conversation_idx").on(t.conversationId),
		index("message_agent_idx").on(t.agentId),
	]
);

export const mcpServers = createTable(
	"mcp_servers",
	(d) => ({
		id: d.uuid().primaryKey().defaultRandom(),
		name: d.text().notNull(),
		url: d.text().notNull(),
		headers: d.jsonb().default({}),
		isActive: d.boolean().default(true).notNull(),
		organizationId: d
			.text()
			.notNull()
			.references(() => organization.id),
		discoveredTools: d.integer().default(0),
		lastConnectedAt: d.timestamp({ withTimezone: true }),
		createdAt: d
			.timestamp({ withTimezone: true })
			.$defaultFn(() => new Date())
			.notNull(),
		updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
	}),
	(t) => [index("mcp_server_org_idx").on(t.organizationId)]
);

export const organizationSettings = createTable(
	"organization_settings",
	(d) => ({
		id: d.uuid().primaryKey().defaultRandom(),
		organizationId: d
			.text()
			.notNull()
			.references(() => organization.id),
		key: d.text().notNull(),
		value: d.jsonb().notNull(),
		updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
	}),
	(t) => [index("org_settings_org_key_idx").on(t.organizationId, t.key)]
);

export const messagesRelations = relations(messages, ({ one }) => ({
	conversation: one(conversations, {
		fields: [messages.conversationId],
		references: [conversations.id],
	}),
	agent: one(agents, {
		fields: [messages.agentId],
		references: [agents.id],
	}),
}));

export const mcpServersRelations = relations(mcpServers, ({ one, many }) => ({
	organization: one(organization, {
		fields: [mcpServers.organizationId],
		references: [organization.id],
	}),
	tools: many(tools),
}));

export const organizationSettingsRelations = relations(
	organizationSettings,
	({ one }) => ({
		organization: one(organization, {
			fields: [organizationSettings.organizationId],
			references: [organization.id],
		}),
	})
);

export const toolsRelations = relations(tools, ({ one, many }) => ({
	organization: one(organization, {
		fields: [tools.organizationId],
		references: [organization.id],
	}),
	mcpServer: one(mcpServers, {
		fields: [tools.mcpServerId],
		references: [mcpServers.id],
	}),
	agentTools: many(agentTools),
}));

export const agentsRelations = relations(agents, ({ one, many }) => ({
	organization: one(organization, {
		fields: [agents.organizationId],
		references: [organization.id],
	}),
	createdBy: one(user, {
		fields: [agents.createdById],
		references: [user.id],
	}),
	agentTools: many(agentTools),
	messages: many(messages),
}));

export const agentToolsRelations = relations(agentTools, ({ one }) => ({
	agent: one(agents, { fields: [agentTools.agentId], references: [agents.id] }),
	tool: one(tools, { fields: [agentTools.toolId], references: [tools.id] }),
}));

export const conversationsRelations = relations(
	conversations,
	({ one, many }) => ({
		organization: one(organization, {
			fields: [conversations.organizationId],
			references: [organization.id],
		}),
		createdBy: one(user, {
			fields: [conversations.createdById],
			references: [user.id],
		}),
		messages: many(messages),
	})
);
