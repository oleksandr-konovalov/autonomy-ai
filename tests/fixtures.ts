import {
  BrowserContext,
  Page,
  PlaywrightTestArgs,
  PlaywrightTestOptions,
  PlaywrightWorkerArgs,
  PlaywrightWorkerOptions,
  TestType,
  test,
} from '@playwright/test';

import { LoginPage } from '@app-pages/login.page';
import { ProjectPage } from '@app-pages/projectPage.ts';

export interface Pages {
  loginPage: LoginPage;
  projectPage: ProjectPage;
}

export const baseFixture: TestType<
  PlaywrightTestArgs & PlaywrightTestOptions & Pages,
  PlaywrightWorkerArgs & PlaywrightWorkerOptions
> = test.extend<Pages>({
  loginPage: async ({ page, context }: { page: Page; context: BrowserContext }, use: (loginPage: LoginPage) => Promise<void>) => {
    await test.step('Create login page fixture', async () => {
      await use(new LoginPage(page, context));
    });
  },
  projectPage: async ({ page, context }: { page: Page; context: BrowserContext }, use: (studioPage: ProjectPage) => Promise<void>) => {
    await test.step('Create project page fixture', async () => {
      await use(new ProjectPage(page, context));
    });
  },
});
