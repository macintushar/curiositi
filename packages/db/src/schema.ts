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
import { z } from "zod";

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
		parentSpaceId: d.uuid().references((): AnyPgColumn => spaces.id),
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

export const selectSpaceSchema = z.object({
	id: z.string().uuid(),
	name: z.string(),
	description: z.string().nullable(),
	icon: z.string().nullable(),
	organizationId: z.string(),
	parentSpaceId: z.string().uuid().nullable(),
	createdAt: z.date(),
	updatedAt: z.date().nullable(),
});

export const createSpaceSchema = z.object({
	id: z.string().uuid().optional(),
	name: z.string(),
	description: z.string().nullable().optional(),
	icon: z.string().nullable().optional(),
	organizationId: z.string(),
	parentSpaceId: z.string().uuid().nullable().optional(),
	createdAt: z.date().optional(),
	updatedAt: z.date().nullable().optional(),
});

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

export const selectFileSchema = z.object({
	id: z.string().uuid(),
	name: z.string(),
	path: z.string(),
	size: z.number().int(),
	type: z.string(),
	organizationId: z.string(),
	uploadedById: z.string(),
	status: z.enum(["pending", "processing", "completed", "failed"]),
	tags: z.unknown().nullable(),
	processedAt: z.date().nullable(),
	createdAt: z.date(),
	updatedAt: z.date().nullable(),
});

export const createFileSchema = z.object({
	id: z.string().uuid().optional(),
	name: z.string(),
	path: z.string(),
	size: z.number().int(),
	type: z.string(),
	organizationId: z.string(),
	uploadedById: z.string(),
	status: z.enum(["pending", "processing", "completed", "failed"]).optional(),
	tags: z.unknown().nullable().optional(),
	processedAt: z.date().nullable().optional(),
	createdAt: z.date().optional(),
	updatedAt: z.date().nullable().optional(),
});

export const fileContents = createTable(
	"file_contents",
	(d) => ({
		id: d.uuid().primaryKey().defaultRandom(),
		fileId: d
			.uuid()
			.notNull()
			.references(() => files.id),
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
			.references(() => files.id),
		spaceId: d
			.uuid()
			.notNull()
			.references(() => spaces.id),
		createdAt: d
			.timestamp({ withTimezone: true })
			.$defaultFn(() => new Date())
			.notNull(),
		updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
	}),
	(t) => [index("space_idx").on(t.spaceId)]
);
