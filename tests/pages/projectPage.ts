import { Locator, expect, Page } from '@playwright/test';

import { AppPage } from '@app-base';
import { env } from '@app-helpers/base';
import { Input } from '@app-components/input.component.ts';
import { Button } from '@app-components/button.component.ts';
import { Sidebar } from '@app-components/sidebar.component.ts';
import { logStep } from '@app-utils/logStep';
import { TaskMessageBubbleText, TimelinePhase, TimelineStatus } from '@app-types/generation.enums';

export class ProjectPage extends AppPage {
  public pagePath: string = env('BASE_URL');
  private pageRoot: Locator = this.page.getByTestId('new-task-page');

  private readonly activeProject: Locator = this.pageRoot.locator('h1').first();
  private readonly taskMessageBubble: Locator = this.page.locator('.bg-second-elevation.max-w-\\[80\\%\\]');
  private readonly systemMessageText: Locator = this.page.locator('span.whitespace-pre-wrap');
  private readonly timelineExpandButton: Locator = this.page.locator('button.flex.items-center.gap-2.text-dark-400.text-sm.py-1');
  private readonly timelineStep: Locator = this.page.locator('span.text-dark-400.text-sm.leading-snug.system-message-shine');
  private readonly planProseBlock: Locator = this.page.locator('.prose.prose-invert.prose-sm');
  private readonly taskSpecCard: Locator = this.page.locator('div.flex.flex-col.relative.overflow-hidden.bg-second-elevation.border.border-divider.shadow-medium.rounded-large');
  private readonly versionMessage: Locator = this.page.getByTestId('version-message');
  private readonly prLink: Locator = this.versionMessage.locator('a');
  public sidebar: Sidebar = new Sidebar(this.page, this.context);
  public buildButton: Button = new Button(this.page, this.context, this.taskSpecCard.getByText('Build'));
  public fastModeButton: Button = new Button(this.page, this.context, this.page.locator('.mode-toggle-button.fast'));
  public smartModeButton: Button = new Button(this.page, this.context, this.page.locator('.mode-toggle-button.smart'));
  public taskInput: Input = new Input(this.page, this.context, 'task-description-textbox');
  public generateButton: Button = new Button(this.page, this.context, 'submit-button');
  public sendToDevsButton: Button = new Button(this.page, this.context, 'send-to-devs-button');
  public confirmSendButton: Button = new Button(this.page, this.context, 'send-to-devs-confirm-button');

  @logStep('Verify project page is loaded')
  public async expectLoaded(): Promise<void> {
    await expect(this.pageRoot, 'Expected Studio page to be loaded').toBeInViewport();
    await this.sidebar.expectLoaded();
    await expect(this.page).toHaveURL(/studio\.autonomyai\.io/);
  }

  @logStep('Verify app preview iframe is visible')
  public async expectAppPreviewIframeVisible(): Promise<void> {
    await expect(this.page.locator('iframe[title="Preview Rendering"]'), 'Expected app preview iframe to be visible').toBeInViewport();
  }

  @logStep('Verify version message contains text')
  public async expectVersionMessageContainsText(text: string): Promise<void> {
    await expect(this.versionMessage.filter({ hasText: text })).toBeInViewport();
  }

  @logStep('Verify active project text')
  public async expectActiveProjectText(text: string): Promise<void> {
    await expect(this.activeProject).toHaveText(text);
  }

  @logStep('Verify task message bubble text')
  public async expectTaskMessageBubbleText(text: TaskMessageBubbleText): Promise<void> {
    await expect(this.taskMessageBubble.filter({ hasText: text })).toBeInViewport();
  }

  @logStep('Verify system message contains text')
  public async expectSystemMessageContainsText(text: string): Promise<void> {
    await expect(this.systemMessageText).toContainText(text);
  }

  @logStep('Verify timeline step count')
  public async expectTimelineStepCountGreaterThan(count: number): Promise<void> {
    expect(await this.timelineStep.count()).toBeGreaterThan(count);
  }

  @logStep('Verify timeline step is not in viewport')
  public async expectTimelineStepNotInViewport(): Promise<void> {
    await expect(this.timelineStep).not.toBeInViewport();
  }

  @logStep('Verify plan prose block is visible')
  public async expectPlanProseBlockVisible(): Promise<void> {
    await expect(this.planProseBlock).toBeInViewport();
  }

  @logStep('Verify task spec card contains text')
  public async expectTaskSpecCardContainsText(text: string): Promise<void> {
    await expect(this.taskSpecCard).toContainText(text);
  }

  @logStep('Verify timeline phase is visible')
  public async expectTimelinePhaseVisible(phase: TimelinePhase, index: number = 0): Promise<void> {
    await expect(this.timelineExpandButton.filter({ hasText: phase }).nth(index)).toBeInViewport();
  }

  @logStep('Verify timeline status is visible')
  public async expectTimelineStatusVisible(status: TimelineStatus, index: number = 0): Promise<void> {
    await expect(this.timelineExpandButton.filter({ hasText: status }).nth(index)).toBeInViewport();
  }

  @logStep('Verify PR link opens expected URL')
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
