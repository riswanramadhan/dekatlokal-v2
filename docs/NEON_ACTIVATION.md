# Neon Activation Notes

Status: prepared, not active in P0.6.1.

The demo remains mock-first:

```env
NEXT_PUBLIC_DATA_SOURCE=mock
DATA_SOURCE=mock
DATABASE_URL=
DIRECT_URL=
```

## Future Activation

1. Create a Neon project and a non-production branch.
2. Set `DATABASE_URL` to the pooled Neon connection string.
3. Set `DIRECT_URL` to the direct Neon connection string for migrations.
4. Keep `NEXT_PUBLIC_DATA_SOURCE=mock`; it is not a public switch.
5. Set `DATA_SOURCE=neon` only in a server environment that has both URLs.
6. Generate the initial migration:

```bash
npm run db:generate
```

7. Review generated SQL for destructive operations.
8. Apply only to the intended Neon branch:

```bash
npm run db:migrate
```

9. Run the server health check:

```bash
curl http://localhost:3000/api/health/database
```

10. Implement Neon repositories one contract at a time and run shared contract tests against the Neon test branch before switching preview.

## Current Guardrails

- `db/client.ts` imports `server-only` and throws when `DATABASE_URL` is empty.
- `db/health.ts` returns `disabled` without querying when `DATABASE_URL` is empty.
- `lib/env.ts` requires `DATABASE_URL` and `DIRECT_URL` only when `DATA_SOURCE=neon`.
- `NEXT_PUBLIC_DATA_SOURCE` validates to `mock` only.
- Neon repository methods are skeletons and fail closed until implemented.
- Mock mode remains the default and does not query a database.
