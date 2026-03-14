// BetterAuth CLI(npx @better-auth/cli generate)로 자동 생성된 Drizzle ORM 스키마
// BetterAuth가 인증 데이터를 DB에 저장하기 위해 필요한 테이블 정의
// 이 스키마를 기반으로 DrizzleKit이 SQL 마이그레이션 스크립트를 생성
import { relations } from "drizzle-orm";
import { boolean, index, pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";
import { post } from "../posts/schemas/schema";

export const user = pgTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified").default(false).notNull(),
	image: text("image"),
	bio: text("bio"),
	website: text("website"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
});

export const session = pgTable(
	"session",
	{
		id: text("id").primaryKey(),
		expiresAt: timestamp("expires_at").notNull(),
		token: text("token").notNull().unique(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
		ipAddress: text("ip_address"),
		userAgent: text("user_agent"),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
	},
	(table) => [index("session_userId_idx").on(table.userId)],
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
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
	"verification",
	{
		id: text("id").primaryKey(),
		identifier: text("identifier").notNull(),
		value: text("value").notNull(),
		expiresAt: timestamp("expires_at").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [index("verification_identifier_idx").on(table.identifier)],
);

// 팔로우 관계를 저장하는 테이블
// 단방향 팔로우: followerId가 followingId를 팔로우하는 관계
// 복합 기본키(followerId + followingId)로 동일한 팔로우 관계의 중복 레코드를 방지
export const follow = pgTable(
	"follow",
	{
		followerId: text("follower_id")
			.notNull()
			.references(() => user.id),
		followingId: text("following_id")
			.notNull()
			.references(() => user.id),
	},
	(table) => [primaryKey({ columns: [table.followerId, table.followingId] })],
);

// Follow 테이블의 관계 정의
// follower/following 각각 user 테이블과 1:1 관계로 연결하여 유저 정보 조회 가능
export const followRelations = relations(follow, ({ one }) => ({
	follower: one(user, {
		fields: [follow.followerId],
		references: [user.id],
	}),
	following: one(user, {
		fields: [follow.followingId],
		references: [user.id],
	}),
}));

// User 테이블의 관계 정의 (User 측)
// many(): 하나의 사용자는 여러 세션, 계정, 게시글을 가질 수 있음 (1:N)
// post 측에서 이미 외래 키(fields/references)를 지정했으므로 여기서는 many()만 선언하면 충분
export const userRelations = relations(user, ({ many }) => ({
	sessions: many(session),
	accounts: many(account),
	posts: many(post),
}));

export const sessionRelations = relations(session, ({ one }) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id],
	}),
}));

export const accountRelations = relations(account, ({ one }) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id],
	}),
}));
