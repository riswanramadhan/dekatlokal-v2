// Tipe data website yang aman dipakai di client maupun server.
import type { SiteCategory } from "./categories";
import type { SiteStatus } from "./access";
import type { SiteAi, SiteContent } from "./schema";
import type { TemplateCode } from "./templates";

export interface SiteRecord {
  id: string;
  ownerId: string;
  slug: string;
  templateCode: TemplateCode;
  category: SiteCategory;
  content: SiteContent;
  status: SiteStatus;
  publishedAt: string | null;
  ai: SiteAi;
  createdAt: string;
  updatedAt: string;
}

export interface StoredChatMessage {
  role: "user" | "assistant";
  content: string;
  at?: string;
}

export interface ConversationSummary {
  sessionId: string;
  messageCount: number;
  lastMessage: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationDetail extends ConversationSummary {
  messages: StoredChatMessage[];
}

export const sitePath = (slug: string) => `/situs/${slug}`;
