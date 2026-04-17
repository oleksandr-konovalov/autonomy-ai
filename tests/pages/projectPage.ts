import {Locator, expect, Page} from '@playwright/test';

import { AppPage } from '../abstractClass';
import { env } from '../../helpers/base';
import {Input} from "@app-components/input.component.ts";
import {Button} from "@app-components/button.component.ts";

export class StudioPage extends AppPage {
  public pagePath: string = env('BASE_URL');

  private pageRoot: Locator = this.page.getByTestId('new-task-page');
  public sidebarArrow: Locator = this.page.getByTestId('sidebar-project-dropdown-trigger');
  public projectDropdown: Locator = this.page.getByTestId('sidebar-project-lists-scroll');
  public projectOption: Locator = this.projectDropdown.locator('li');
  public activeProject: Locator = this.pageRoot.locator('h1').first();
  public taskMessageBubble: Locator = this.page.locator('.bg-second-elevation.max-w-\\[80\\%\\]');
  public timelineExpandButton: Locator = this.page.locator('button.flex.items-center.gap-2.text-dark-400.text-sm.py-1');
  public test: Locator = this.page.locator('span.whitespace-pre-wrap');
  public timelineStep: Locator = this.page.locator('span.text-dark-400.text-sm.leading-snug.system-message-shine');
  public planProseBlock: Locator = this.page.locator('.prose.prose-invert.prose-sm');
  public taskSpecCard: Locator = this.page.locator('div.flex.flex-col.relative.overflow-hidden.bg-second-elevation.border.border-divider.shadow-medium.rounded-large');
  public buildButton: Button = new Button(this.page, this.context, this.taskSpecCard.getByText('Build'));
  public versionMessage: Locator = this.page.getByTestId('version-message');
  public taskInput: Input = new Input(this.page, this.context, 'task-description-textbox');
  public generateButton: Button = new Button(this.page, this.context, 'submit-button');
  public sendToDevsButton: Button = new Button(this.page, this.context, 'send-to-devs-button');
  public confirmSendButton: Button = new Button(this.page, this.context, 'send-to-devs-confirm-button');
  public prLink: Locator = this.versionMessage.locator('a');

  public async expectLoaded(): Promise<void> {
    await expect(this.pageRoot, 'Expected Studio page to be loaded').toBeVisible();
    await expect(this.page).toHaveURL(/studio\.autonomyai\.io/);
  }

  public async expectAppPreviewIframeVisible(): Promise<void> {
    await expect(this.page.locator('iframe[title="Preview Rendering"]'), 'Expected app preview iframe to be visible').toBeVisible();
  }

  public async expectVersionMessageContainsText(text: string): Promise<void> {
    await expect(this.versionMessage.filter({ hasText: text })).toBeInViewport();
  }

  public async checkPrLink(): Promise<void> {
    const expectedUrl: string = await this.prLink.getAttribute('href');
    const newPagePromise: Promise<Page> = this.context.waitForEvent('page');
    await this.prLink.click();
    const newPage = await newPagePromise;
    await newPage.waitForLoadState('networkidle');
    expect(newPage.url()).toBe(expectedUrl);
    await newPage.close();
  }
}
