import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import {
  businessMemberRoleEnum,
  businessStageEnum,
  businessStatusEnum,
  digitalComfortEnum,
  fontScaleEnum,
  membershipStatusEnum,
  preferredDaypartEnum,
  userStatusEnum,
} from "@/db/schema/enums";
import { lifecycleColumns } from "@/db/schema/shared";

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    phone: varchar("phone", { length: 32 }),
    email: varchar("email", { length: 320 }),
    avatarUrl: text("avatar_url"),
    status: userStatusEnum("status").notNull().default("active"),
    ...lifecycleColumns(),
  },
  (table) => [
    uniqueIndex("users_phone_unique").on(table.phone),
    uniqueIndex("users_email_unique").on(table.email),
    check(
      "users_phone_or_email_check",
      sql`${table.phone} is not null or ${table.email} is not null`,
    ),
  ],
);

export const authIdentities = pgTable(
  "auth_identities",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    provider: varchar("provider", { length: 64 }).notNull(),
    providerSubject: text("provider_subject").notNull(),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("auth_identities_provider_subject_unique").on(
      table.provider,
      table.providerSubject,
    ),
    index("auth_identities_user_idx").on(table.userId),
  ],
);

export const businesses = pgTable(
  "businesses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerUserId: uuid("owner_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    name: text("name").notNull(),
    slug: varchar("slug", { length: 120 }).notNull(),
    category: text("category").notNull(),
    stage: businessStageEnum("stage").notNull(),
    city: text("city"),
    logoUrl: text("logo_url"),
    status: businessStatusEnum("status").notNull().default("active"),
    profileCompleteness: integer("profile_completeness").notNull().default(0),
    ...lifecycleColumns(),
  },
  (table) => [
    uniqueIndex("businesses_active_slug_unique")
      .on(table.slug)
      .where(sql`${table.status} = 'active'`),
    index("businesses_owner_user_idx").on(table.ownerUserId),
    check(
      "businesses_profile_completeness_range",
      sql`${table.profileCompleteness} between 0 and 100`,
    ),
  ],
);

export const businessMembers = pgTable(
  "business_members",
  {
    businessId: uuid("business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: businessMemberRoleEnum("role").notNull(),
    status: membershipStatusEnum("status").notNull().default("active"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    primaryKey({
      columns: [table.businessId, table.userId],
      name: "business_members_pk",
    }),
    index("business_members_user_idx").on(table.userId),
  ],
);

export const learningPreferences = pgTable("learning_preferences", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  dailyMinutes: integer("daily_minutes").notNull(),
  digitalComfort: digitalComfortEnum("digital_comfort").notNull(),
  preferredFormats: jsonb("preferred_formats").$type<string[]>().notNull(),
  preferredDaypart: preferredDaypartEnum("preferred_daypart").notNull(),
  fontScale: fontScaleEnum("font_scale").notNull().default("standard"),
  remindersEnabled: boolean("reminders_enabled").notNull().default(false),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
