import { BrowserContext, Locator, Page, expect } from '@playwright/test';

import { Component } from '../abstractClass';

export class Form extends Component {
  private readonly form: Locator;

  public constructor(page: Page, context: BrowserContext, testId: string) {
    super(page, context);
    this.form = page.getByTestId(testId);
  }

  public async expectLoaded(): Promise<void> {
    await expect(this.form, 'Expected form to be visible').toBeVisible();
  }

  public async expectVisible(): Promise<void> {
    await expect(this.form, 'Expect form to be visible').toBeVisible();
  }

  public async expectNotVisible(): Promise<void> {
    await expect(this.form, 'Expect form NOT to be visible').not.toBeVisible();
  }

  public async expectContainText(text: string): Promise<void> {
    await expect(this.form, `Expect form to contain text: ${text}`).toContainText(text);
  }
}
