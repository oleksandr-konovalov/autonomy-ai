import { BrowserContext, Locator, Page, expect, test } from '@playwright/test';

import { Component } from '../abstractClass';
import { logStep } from '../../utils/logStep';

export class Input extends Component {
  public input: Locator;

  public constructor(page: Page, context: BrowserContext, testId: string) {
    super(page, context);
    this.input = page.getByTestId(testId);
  }

  public async expectLoaded(): Promise<void> {
    await expect(this.input, 'Expected input to be visible').toBeVisible();
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

  public async expectVisible(index: number = 0): Promise<void> {
    await expect(this.input.nth(index), 'Expect input to be visible').toBeVisible();
  }

  public async expectNotVisible(index: number = 0): Promise<void> {
    await expect(this.input.nth(index), 'Expect input NOT to be visible').not.toBeVisible();
  }

  public async expectEnabled(): Promise<void> {
    await expect(this.input, 'Expect input to be enabled').toBeEnabled();
  }

  public async expectDisabled(): Promise<void> {
    await expect(this.input, 'Expect input to be disabled').toBeDisabled();
  }

  public async expectValue(value: string | RegExp, index: number = 0): Promise<void> {
    await expect(this.input.nth(index), `Expect input to have value: ${value}`).toHaveValue(value);
  }

  public async expectNotEmpty(index: number = 0): Promise<void> {
    await expect(this.input.nth(index), 'Expect input not to be empty').not.toHaveValue('');
  }

  public async expectPlaceholder(text: string): Promise<void> {
    await expect(this.input, `Expect input placeholder to be: ${text}`).toHaveAttribute('placeholder', text);
  }

  public async expectCount(amount: number): Promise<void> {
    await expect(this.input, `Expect input count to be: ${amount}`).toHaveCount(amount);
  }
}
