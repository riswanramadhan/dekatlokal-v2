export type PreAuthAnalyticsEventName =
  | "preauth_claim_viewed"
  | "recall_started"
  | "recall_option_selected"
  | "recall_submitted"
  | "recall_partial"
  | "recall_completed"
  | "recall_help_used"
  | "path_preview_viewed"
  | "signup_wall_viewed"
  | "preauth_to_signup"
  | "claim_associated_after_auth";

export type PreAuthAnalyticsEvent = {
  name: PreAuthAnalyticsEventName;
  metadata?: Record<string, string | number | boolean>;
};

export function trackMockAnalytics(event: PreAuthAnalyticsEvent) {
  // Intentionally transport-free in P0.4.5. The typed boundary can be replaced
  // by a production analytics adapter without changing feature components.
  void event;
}
