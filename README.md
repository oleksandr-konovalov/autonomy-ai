# autonomy-ai

Playwright end-to-end tests for `studio.autonomyai.io`.

## How to install and run

1. Install dependencies:
```bash
npm install
```

2. Create a local env file:
```bash
cp .env.example .env
```

3. Fill in the required credentials in `.env`.

4. Install Playwright browsers if needed:
```bash
npm run pw:browsers:install
```

5. Run the test suite:
```bash
npm run pw:test
```

Useful commands:

```bash
npm run pw:debug
npm run pw:ui
npm run pw:ts:build
```

## Environment variables needed

The project requires the following environment variables:

| Variable | Required | Description |
|---|---|---|
| `TEST_EMAIL` | Yes | Email for the test account used in login setup |
| `TEST_PASSWORD` | Yes | Password for the test account used in login setup |
| `BASE_URL` | Yes | Studio URL under test, defaults to `https://studio.autonomyai.io` in `.env.example` |

## Assumptions and known limitations

- The suite currently assumes the authenticated user has access to the default project configured in the tests.
- The main studio smoke test is a long end-to-end happy path, so a failure in an early phase blocks the later assertions in the same test.
- Several selectors still depend on CSS classes instead of dedicated `data-testid` attributes, which makes the suite more sensitive to UI refactors.
- The flow relies on backend polling responses for generation/storybook state, so API timing or response-shape changes can affect stability.
- Authentication state is cached in `tests/.auth` and reused locally based on file age.
