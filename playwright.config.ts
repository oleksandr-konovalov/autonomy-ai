import 'dotenv/config';

import { defineConfig, devices, type PlaywrightTestConfig, type Project } from '@playwright/test';
import { isTokenExistAndValidByTime } from '@app-helpers/auth.helper';
import { Constants } from '@app-constants/constants.ts';
import { env } from '@app-helpers/base';

const authFilePath: string = `tests/.auth/${env('TEST_EMAIL')}.json`;

function getProjects(): Project[] {
  const projects: Project[] = [
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

  return projects.map((project: Project) => {
    if (project.name !== 'setup') {
      project.dependencies = ['setup'];
    }

    return project;
  });
}

const commonUse: PlaywrightTestConfig['use'] = {
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
  timeout: Constants.TWENTY_FIVE_MINUTES,
  projects: getProjects(),
});
