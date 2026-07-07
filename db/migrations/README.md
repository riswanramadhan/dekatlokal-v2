# Drizzle Migrations

This folder is reserved for generated Drizzle migrations.

P0.6.1 prepares the schema and migration structure only. Do not run migrations
against production until a Neon project, development branch, rollback plan, and
seed review exist.

Future flow:

1. Set `DIRECT_URL` to the Neon direct connection string.
2. Keep `DATABASE_URL` as the pooled application connection string.
3. Run `npm run db:generate` to create the initial migration from `db/schema`.
4. Review the generated SQL for destructive operations.
5. Run `npm run db:migrate` only against the intended Neon branch.
