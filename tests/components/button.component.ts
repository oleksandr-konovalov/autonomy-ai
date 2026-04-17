import { BrowserContext, Locator, Page, expect } from '@playwright/test';

import { Component } from '../abstractClass';
import { Constants } from '../../constants/constants';
import { logStep } from '../../utils/logStep';

export class Button extends Component {
  private readonly button: Locator;

  public constructor(page: Page, context: BrowserContext, testId: string) {
    super(page, context);
    this.button = page.getByTestId(testId);
  }

  public async expectLoaded(): Promise<void> {
    await expect(this.button, 'Expected button to be visible').toBeVisible();
  }

  public async expectEnabled(options: { index?: number; timeout?: number } = {}): Promise<void> {
    const { index = 0, timeout } = options;
    await expect(this.button.nth(index), 'Expected button to be enabled').toBeEnabled({ timeout });
  }

  public async expectDisabled(options: { index?: number; timeout?: number } = {}): Promise<void> {
    const { index = 0, timeout } = options;
    await expect(this.button.nth(index), 'Expected button to be disabled').toBeDisabled({ timeout });
  }

  public async expectNotVisible(index: number = 0): Promise<void> {
    await expect(this.button.nth(index), 'Expected button not to be visible').not.toBeVisible();
  }

  public async expectVisible(index: number = 0): Promise<void> {
    await expect(this.button.nth(index), 'Expected button to be visible').toBeVisible();
  }

  public async expectHaveText(text: string | RegExp, index: number = 0): Promise<void> {
    await expect(this.button.nth(index), `Expect button to have text: ${text}`).toHaveText(text);
  }

  public async expectContainText(text: string | RegExp, index: number = 0): Promise<void> {
    await expect(this.button.nth(index), `Expect button to contain text: ${text}`).toContainText(text);
  }

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
