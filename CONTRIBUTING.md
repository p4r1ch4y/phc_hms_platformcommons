# Contributing to PHC Commons

Thanks for your interest in contributing! This project follows common open-source practices — below are quick guidelines to help your contributions land smoothly.

1. Fork the repo and create a topic branch for your change.

2. Keep commits small and focused. Use descriptive commit messages.

3. Run linters and formatters before submitting a PR. The repo uses TypeScript and standard JS tooling.

4. If you modify Prisma schemas, run:

```bash
npm run -w packages/database generate
npx prisma migrate dev --schema=packages/database/prisma/schema.prisma
```

5. Add or update tests for new behavior where applicable.

6. Open a Pull Request describing the change, motivation, and testing instructions.

7. Be responsive to review feedback and keep PRs up to date with the `main` branch if requested.

If you contribute significant features, please ensure alignments with the repo architecture and multi-tenant patterns described in `packages/database` and `@phc/common`.

Thanks — maintainers
