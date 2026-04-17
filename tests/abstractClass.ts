import { type BrowserContext, type Page, expect } from '@playwright/test';

import { logStep } from '../utils/logStep';

export abstract class PageHolder {
  public constructor(
    protected page: Page,
    protected context: BrowserContext,
  ) {}

  public async closeBrowser(): Promise<void> {
    await this.context.close();
  }
}

export abstract class Component extends PageHolder {
  public abstract expectLoaded(stringOrBool?: string | boolean): Promise<void>;

  public async isLoaded(): Promise<boolean> {
    try {
      await this.expectLoaded();
      return true;
    } catch {
      return false;
    }
  }
}

export abstract class AppPage extends Component {
  public abstract pagePath: string;

  public async open(path?: string): Promise<void> {
    await this.page.goto(path ?? this.pagePath);
    await this.expectLoaded();
  }

  public async openWithoutLoadingCheck(path?: string): Promise<void> {
    await this.page.goto(path ?? this.pagePath);
  }

  @logStep('Close tab')
  public async closeTab(): Promise<void> {
    await this.page.close();
  }

  @logStep('Check page has URL')
  public async expectURL(url: string | RegExp): Promise<void> {
    await expect(this.page, `Expect page to have URL: ${url}`).toHaveURL(url);
  }

  public async reload(withLoadWaiter: boolean = true): Promise<void> {
    await this.page.reload();
    if (withLoadWaiter) {
      await this.expectLoaded();
    }
  }

  public async goBack(): Promise<void> {
    await this.page.goBack({ waitUntil: 'load' });
  }

  public async waitForTimeout(ms: number): Promise<void> {
    await this.page.waitForTimeout(ms);
  }

  protected updatePagePath(): void {}
}
