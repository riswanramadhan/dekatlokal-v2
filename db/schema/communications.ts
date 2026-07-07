import {
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { auditEventTypeEnum } from "@/db/schema/enums";
import { businesses, users } from "@/db/schema/identity";
import { JsonRecord } from "@/db/schema/shared";

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 80 }).notNull(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    actionUrl: text("action_url"),
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("notifications_user_created_idx").on(table.userId, table.createdAt),
    index("notifications_unread_idx").on(table.userId, table.readAt),
  ],
);

export const auditEvents = pgTable(
  "audit_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    actorUserId: uuid("actor_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    businessId: uuid("business_id").references(() => businesses.id, {
      onDelete: "set null",
    }),
    eventType: auditEventTypeEnum("event_type").notNull(),
    metadataJson: jsonb("metadata_json").$type<JsonRecord>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("audit_events_business_created_idx").on(table.businessId, table.createdAt),
    index("audit_events_actor_created_idx").on(table.actorUserId, table.createdAt),
  ],
);
