import { BrowserContext, Locator, Page, expect, test } from '@playwright/test';

import { Component } from '@app-base';
import { logStep } from '@app-utils/logStep';

export class Input extends Component {
  public input: Locator;

  public constructor(page: Page, context: BrowserContext, testId: string) {
    super(page, context);
    this.input = page.getByTestId(testId);
  }

  @logStep('Verify input is loaded')
  public async expectLoaded(): Promise<void> {
    await expect(this.input, 'Expected input to be visible').toBeInViewport();
  }

  @logStep('Fill input')
  public async fill(text: string, index: number = 0): Promise<void> {
    await test.step(`Fill input with "${text}"`, async () => {
      await this.input.nth(index).fill(text);
    });
  }

  @logStep('Clear input')
  public async clear(index: number = 0): Promise<void> {
    await this.input.nth(index).clear();
  }

  @logStep('Click on input')
  public async click(options: { force?: boolean } = {}): Promise<void> {
    await this.input.click({ force: options.force });
  }

  @logStep('Focus out from input')
  public async focusOut(): Promise<void> {
    await this.input.focus();
    await this.page.keyboard.press('Tab');
  }

  @logStep('Verify input is visible')
  public async expectInViewport(index: number = 0): Promise<void> {
    await expect(this.input.nth(index), 'Expect input to be visible').toBeInViewport();
  }

  @logStep('Verify input is not visible')
  public async expectNotInViewport(index: number = 0): Promise<void> {
    await expect(this.input.nth(index), 'Expect input NOT to be visible').not.toBeInViewport();
  }

  @logStep('Verify input is enabled')
  public async expectEnabled(): Promise<void> {
    await expect(this.input, 'Expect input to be enabled').toBeEnabled();
  }

  @logStep('Verify input is disabled')
  public async expectDisabled(): Promise<void> {
    await expect(this.input, 'Expect input to be disabled').toBeDisabled();
  }

  @logStep('Verify input value')
  public async expectValue(value: string | RegExp, index: number = 0): Promise<void> {
    await expect(this.input.nth(index), `Expect input to have value: ${value}`).toHaveValue(value);
  }

  @logStep('Verify input is not empty')
  public async expectNotEmpty(index: number = 0): Promise<void> {
    await expect(this.input.nth(index), 'Expect input not to be empty').not.toHaveValue('');
  }

  @logStep('Verify input placeholder')
  public async expectPlaceholder(text: string): Promise<void> {
    await expect(this.input, `Expect input placeholder to be: ${text}`).toHaveAttribute('placeholder', text);
  }

  @logStep('Verify input count')
  public async expectCount(amount: number): Promise<void> {
    await expect(this.input, `Expect input count to be: ${amount}`).toHaveCount(amount);
  }
}
