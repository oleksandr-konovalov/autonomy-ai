import { BrowserContext, Locator, Page, expect } from '@playwright/test';

import { Component } from '@app-base';
import { Dropdown } from '@app-components/dropdown.component.ts';
import { logStep } from '@app-utils/logStep';

export class Sidebar extends Component {
  private readonly sidebar: Locator = this.page.getByTestId('sidebar');
  public readonly projectDropdown: Dropdown = new Dropdown(this.page, this.context, {
    button: this.sidebar.getByTestId('sidebar-project-dropdown-trigger'),
    dropdown: this.sidebar.getByTestId('sidebar-project-lists-scroll'),
  });

  public constructor(page: Page, context: BrowserContext) {
    super(page, context);
  }

  @logStep('Verify sidebar is loaded')
  public async expectLoaded(): Promise<void> {
    await expect(this.sidebar, 'Expected sidebar to be visible').toBeVisible();
  }

  @logStep('Select project from sidebar')
  public async selectProject(projectName: string, timeout?: number): Promise<void> {
    await this.projectDropdown.button.click();
    await this.projectDropdown.option(projectName).click();
    await this.projectDropdown.waitForHidden(timeout);
  }
}
