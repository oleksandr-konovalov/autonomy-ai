import 'dotenv/config';

import { defineConfig, devices } from '@playwright/test';
import { isTokenExistAndValidByTime } from './helpers/auth.helper';
import { Constants } from './constants/constants';
import { env } from './helpers/base';

const authFilePath: string = `tests/.auth/${env('USER_EMAIL')}.json`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getProjects(): any {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const projects: Record<string, any>[] = [
    { name: 'setup', testMatch: /.*auth\.setup\.ts/ },
    {
      name: 'Studio',
      testDir: './tests/e2e/studio',
      use: commonUse,
    },
  ];

  if (process.env.CI) {
    return projects;
  }

  if (isTokenExistAndValidByTime(authFilePath)) {
    return projects;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return projects.map((project: any) => {
    if (project.name !== 'setup') {
      project.dependencies = ['setup'];
    }

    return project;
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const commonUse: any = {
  ...devices['Desktop Chrome'],
  channel: 'chrome',
  storageState: authFilePath,
  locale: 'en-US',
  timezoneId: 'UTC',
  viewport: { width: 1920, height: 1080 },
};

// eslint-disable-next-line import/no-default-export
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html']],
  use: {
    baseURL: env('BASE_URL'),
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
    actionTimeout: Constants.THIRTY_SECONDS,
    navigationTimeout: Constants.SIXTY_SECONDS,
  },
  expect: { timeout: Constants.FORTY_SECONDS },
  timeout: Constants.SEVEN_MINUTES,
  projects: getProjects(),
});
