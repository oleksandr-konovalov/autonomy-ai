import { type BrowserContext, Locator, type Page, expect } from '@playwright/test';

import { logStep } from '@app-utils/logStep';

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
  @logStep('Verify component element is visible')
  protected async expectElementVisible(locator: Locator, message: string): Promise<void> {
    await expect(locator, message).toBeInViewport();
  }

  @logStep('Verify component element is not visible')
  protected async expectElementNotVisible(locator: Locator, message: string): Promise<void> {
    await expect(locator, message).not.toBeInViewport();
  }
}

export abstract class AppPage extends PageHolder {
  public abstract pagePath: string;
  public abstract expectLoaded(stringOrBool?: string | boolean): Promise<void>;

  public get getPage(): Page {
    return this.page;
  }

  @logStep('Open page')
  public async open(path?: string): Promise<void> {
    await this.page.goto(path ?? this.pagePath);
    await this.expectLoaded();
  }

  @logStep('Open page without load check')
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

  @logStep('Reload page')
  public async reload(withLoadWaiter: boolean = true): Promise<void> {
    await this.page.reload();
    if (withLoadWaiter) {
      await this.expectLoaded();
    }
  }

  @logStep('Navigate back')
  public async goBack(): Promise<void> {
    await this.page.goBack({ waitUntil: 'load' });
  }

  @logStep('Wait for timeout')
  public async waitForTimeout(ms: number): Promise<void> {
    await this.page.waitForTimeout(ms);
  }
}
