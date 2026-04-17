import { StudioPage } from '@app-pages/studio.page';
import { baseFixture as test } from '../../fixtures';
import {expect} from "@playwright/test";
import {Constants} from "@app-constants/constants.ts";

test('Studio page opens successfully', { tag: '@smoke' }, async ({ studioPage }: { studioPage: StudioPage }): Promise<void> => {
  await studioPage.open();
  await studioPage.sidebarArrow.click();
  await studioPage.projectOption.filter({ hasText: 'jira-clone' }).click();
  await studioPage.projectDropdown.waitFor({ state: 'hidden', timeout: Constants.FIVE_SECONDS });
  await expect(studioPage.activeProject).toHaveText('oleksandr-konovalov/jira-clone');
  await studioPage.taskInput.fill('add project search to the Projects page. It should be able to search via project name, matches from project description or any project task id or name');
  await studioPage.generateButton.click();
  await expect(studioPage.taskMessageBubble).toHaveText('add project search to the Projects page. It should be able to search via project name, matches from project description or any project task id or name');
  await expect(studioPage.timelineExpandButton).toContainText('Planning');
});
