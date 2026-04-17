import { BrowserContext, Locator, Page, expect } from '@playwright/test';

import { Component } from '@app-base';
import { logStep } from '@app-utils/logStep';
import { Button } from '@app-components/button.component.ts';

export class Dropdown extends Component {
  private readonly dropdown: Locator;
  public readonly button: Button;

  public constructor(
    page: Page,
    context: BrowserContext,
    {
      button,
      dropdown,
    }: {
      button: string | Locator;
      dropdown: string | Locator;
    },
  ) {
    super(page, context);
    this.button = new Button(page, context, button);
    this.dropdown = typeof dropdown === 'string' ? page.getByTestId(dropdown) : dropdown;
  }

  @logStep('Verify dropdown is loaded')
  public async expectLoaded(): Promise<void> {
    await expect(this.dropdown, 'Expected dropdown to be visible').toBeInViewport();
  }

  @logStep('Wait for dropdown to be hidden')
  public async waitForHidden(timeout?: number): Promise<void> {
    await this.dropdown.waitFor({ state: 'hidden', timeout });
  }

  public option(text: string): Locator {
    return this.dropdown.locator('li').filter({ hasText: text });
  }
}
