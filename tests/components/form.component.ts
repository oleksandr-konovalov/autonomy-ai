import { BrowserContext, Locator, Page, expect } from '@playwright/test';

import { Component } from '@app-base';
import { logStep } from '@app-utils/logStep';

export class Form extends Component {
  private readonly form: Locator;

  public constructor(page: Page, context: BrowserContext, testId: string) {
    super(page, context);
    this.form = page.getByTestId(testId);
  }

  @logStep('Verify form is loaded')
  public async expectLoaded(): Promise<void> {
    await expect(this.form, 'Expected form to be visible').toBeInViewport();
  }

  @logStep('Verify form is visible')
  public async expectInViewport(): Promise<void> {
    await expect(this.form, 'Expect form to be visible').toBeInViewport();
  }

  @logStep('Verify form is not visible')
  public async expectNotInViewport(): Promise<void> {
    await expect(this.form, 'Expect form NOT to be visible').not.toBeInViewport();
  }

  @logStep('Verify form contains text')
  public async expectContainsText(text: string): Promise<void> {
    await expect(this.form, `Expect form to contain text: ${text}`).toContainText(text);
  }
}
