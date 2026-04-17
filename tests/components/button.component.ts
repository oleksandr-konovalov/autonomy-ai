import { BrowserContext, Locator, Page, expect } from '@playwright/test';

import { Component } from '@app-base';
import { Constants } from '@app-constants/constants.ts';
import { logStep } from '@app-utils/logStep';

export class Button extends Component {
  private readonly button: Locator;

  public constructor(page: Page, context: BrowserContext, selector: string | Locator) {
    super(page, context);
    this.button = typeof selector === 'string' ? page.getByTestId(selector) : selector;
  }

  @logStep('Verify button is loaded')
  public async expectLoaded(): Promise<void> {
    await expect(this.button, 'Expected button to be visible').toBeInViewport();
  }

  @logStep('Verify button is enabled')
  public async expectEnabled(options: { index?: number; timeout?: number } = {}): Promise<void> {
    const { index = 0, timeout } = options;
    await expect(this.button.nth(index), 'Expected button to be enabled').toBeEnabled({ timeout });
  }

  @logStep('Verify button is disabled')
  public async expectDisabled(options: { index?: number; timeout?: number } = {}): Promise<void> {
    const { index = 0, timeout } = options;
    await expect(this.button.nth(index), 'Expected button to be disabled').toBeDisabled({ timeout });
  }

  @logStep('Verify button is not visible')
  public async expectNotInViewport(index: number = 0): Promise<void> {
    await expect(this.button.nth(index), 'Expected button not to be visible').not.toBeInViewport();
  }

  @logStep('Verify button is visible')
  public async expectInViewport(index: number = 0): Promise<void> {
    await expect(this.button.nth(index), 'Expected button to be visible').toBeInViewport();
  }

  @logStep('Verify button text matches')
  public async expectHasText(text: string | RegExp, index: number = 0): Promise<void> {
    await expect(this.button.nth(index), `Expect button to have text: ${text}`).toHaveText(text);
  }

  @logStep('Verify button contains text')
  public async expectContainsText(text: string | RegExp, index: number = 0): Promise<void> {
    await expect(this.button.nth(index), `Expect button to contain text: ${text}`).toContainText(text);
  }

  @logStep('Verify button count')
  public async expectCount(amount: number): Promise<void> {
    await expect(this.button, `Expect button to have count: ${amount}`).toHaveCount(amount);
  }

  @logStep('Click button')
  public async click(options: { index?: number; timeout?: number; force?: boolean } = {}): Promise<void> {
    await this.button
      .nth(options.index ?? 0)
      .click({ timeout: options?.timeout ?? Constants.THIRTY_SECONDS, force: options.force ?? false });
  }

  @logStep('Hover over button')
  public async hover({ index = 0, force = false }: { index?: number; force?: boolean } = {}): Promise<void> {
    await this.button.nth(index).hover({ force });
  }
}
