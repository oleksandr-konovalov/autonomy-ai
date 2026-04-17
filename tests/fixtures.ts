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
import { StudioPage } from '@app-pages/studio.page';

export interface Pages {
  loginPage: LoginPage;
  studioPage: StudioPage;
}

export const baseFixture: TestType<
  PlaywrightTestArgs & PlaywrightTestOptions & Pages,
  PlaywrightWorkerArgs & PlaywrightWorkerOptions
> = test.extend<Pages>({
  loginPage: async ({ page, context }: { page: Page; context: BrowserContext }, use: (loginPage: LoginPage) => Promise<void>) => {
    await use(new LoginPage(page, context));
  },
  studioPage: async ({ page, context }: { page: Page; context: BrowserContext }, use: (studioPage: StudioPage) => Promise<void>) => {
    await use(new StudioPage(page, context));
  },
});
