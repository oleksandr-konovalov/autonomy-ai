import { waitForGenerationResponse, waitForStorybookResponse } from '@app-helpers/api.helper';
import {
  GenerationStatusApi,
  GenerationStepApi,
  TaskMessageBubbleText,
  TaskType,
  TimelinePhase,
  TimelineStatus,
} from '@app-types/generation.enums';
import { baseFixture as test } from '@app-fixtures';
import { Constants } from '@app-constants/constants.ts';

test.describe('Full task flow', () => {
  test(`Fast mode flow - Plan flow`, { tag: '@smoke' }, async ({ projectPage }): Promise<void> => {
    await test.step('Open studio and create a new task via fast flow', async () => {
      await projectPage.open();
      await projectPage.sidebar.projectDropdown.open();
      await projectPage.sidebar.projectDropdown.selectOptionByText(Constants.DEFAULT_PROJECT_NAME);
      await projectPage.fastModeButton.expectInViewport();
      await projectPage.expectActiveProjectText(`${Constants.DEFAULT_USERNAME}/${Constants.DEFAULT_PROJECT_NAME}`);
      await projectPage.stepDropdown.open();
      await projectPage.stepDropdown.selectOptionByText(TaskType.PLAN);
      await projectPage.stepDropdown.expectOptionSelected(TaskType.PLAN);
      await projectPage.taskInput.fill(TaskMessageBubbleText.GENERATE_PROMPT);
      await projectPage.generateButton.click();
      await projectPage.expectTaskMessageBubbleText(TaskMessageBubbleText.GENERATE_PROMPT);
      await projectPage.expectSystemMessageContainsText('Setting up environment');
    });

    await test.step('Check of planning phase', async () => {
      await projectPage.expectTimelinePhaseVisible(TimelinePhase.PLANNING);
      await projectPage.expectTimelineStatusVisible(TimelineStatus.RUNNING_STEP);
      await projectPage.expectTimelineStepCountGreaterThan(0);

      await waitForGenerationResponse(
        projectPage.getPage,
        {
          step: GenerationStepApi.PLANNING,
          generationStatus: GenerationStatusApi.PENDING,
        },
        Constants.FIVE_MINUTES,
      );

      await projectPage.expectTimelineStepNotInViewport();
      await projectPage.expectTimelinePhaseVisible(TimelinePhase.PLANNING);
      await projectPage.expectTimelineStatusVisible(TimelineStatus.COMPLETED);
      await projectPage.expectPlanProseBlockVisible();
      await projectPage.expectTaskSpecCardContainsText('Task Spec Doc');
      await projectPage.expectTaskSpecCardContainsText('Click to view full document');
    });

    await test.step('Check of approving plan', async () => {
      await projectPage.buildButton.expectInViewport();
      await projectPage.buildButton.click();
      await projectPage.expectTaskMessageBubbleText(TaskMessageBubbleText.BUILD_APPROVED);
    });

    await test.step('Check of code generation phase', async () => {
      await projectPage.expectTimelinePhaseVisible(TimelinePhase.CODE_GENERATION);
      await projectPage.expectTimelineStatusVisible(TimelineStatus.RUNNING_STEP);
      await projectPage.expectTimelineStepCountGreaterThan(0);

      await waitForStorybookResponse(projectPage.getPage, Constants.SEVEN_MINUTES);
      await projectPage.expectAppPreviewIframeVisible();

      await waitForGenerationResponse(
        projectPage.getPage,
        {
          step: GenerationStepApi.CODE_GENERATION,
          generationStatus: GenerationStatusApi.PENDING,
        },
        Constants.SEVEN_MINUTES,
      );
      await projectPage.expectTimelinePhaseVisible(TimelinePhase.CODE_GENERATION);
      await projectPage.expectTimelineStatusVisible(TimelineStatus.COMPLETED, 1);
      await projectPage.expectVersionMessageContainsText('V01');
    });

    await test.step('Send generated changes to developers and verify PR output', async () => {
      await projectPage.sendToDevsButton.click();
      await projectPage.confirmSendButton.click();
      await projectPage.sendToDevsButton.expectDisabled();
      await projectPage.expectTaskMessageBubbleText(TaskMessageBubbleText.SEND_TO_DEVS);
      await projectPage.expectTimelinePhaseVisible(TimelinePhase.PRE_PR);
      await projectPage.expectTimelineStatusVisible(TimelineStatus.RUNNING_STEP);

      await waitForGenerationResponse(
        projectPage.getPage,
        {
          step: GenerationStepApi.PRE_PR,
          generationStatus: GenerationStatusApi.PENDING,
        },
        Constants.TWELVE_MINUTES,
      );

      await projectPage.expectTimelinePhaseVisible(TimelinePhase.PRE_PR);
      await projectPage.expectTimelineStatusVisible(TimelineStatus.COMPLETED, 2);
      await projectPage.expectVersionMessageContainsText('V02');
      await projectPage.expectVersionMessageContainsText("Here's the PR you can share:");
      await projectPage.checkPrLink();
    });
  });
});
