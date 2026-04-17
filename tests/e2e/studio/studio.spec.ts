import { ProjectPage } from '@app-pages/projectPage.ts';
import { waitForGenerationResponse, waitForStorybookResponse } from '@app-helpers/api.helper';
import { GenerationStatusApi, GenerationStepApi, TaskMessageBubbleText, TimelinePhase, TimelineStatus } from '@app-types/generation.enums';
import { baseFixture as test } from '@app-fixtures';
import { Constants } from '@app-constants/constants.ts';

test.describe('Task flow', () => {
  test('Fast mode flow', { tag: '@smoke' }, async ({ projectPage }: { projectPage: ProjectPage }): Promise<void> => {
    await test.step('Open studio and create a new task via fast flow', async () => {
      await projectPage.open();
      await projectPage.sidebar.selectProject(Constants.DEFAULT_PROJECT_NAME, Constants.FIVE_SECONDS);
      await projectPage.fastModeButton.expectInViewport();
      await projectPage.expectActiveProjectText(`${Constants.DEFAULT_USERNAME}/${Constants.DEFAULT_PROJECT_NAME}`);
      await projectPage.taskInput.fill(TaskMessageBubbleText.GENERATE_PROMPT);
      await projectPage.generateButton.click();
      await projectPage.expectTaskMessageBubbleText(TaskMessageBubbleText.GENERATE_PROMPT);
    });

    await test.step('Verify planning phase is generated', async () => {
      await projectPage.expectSystemMessageContainsText('Setting up environment');
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
      await projectPage.buildButton.expectInViewport();
    });

    await test.step('Approve the plan and verify code generation', async () => {
      await projectPage.buildButton.click();
      await projectPage.expectTaskMessageBubbleText(TaskMessageBubbleText.BUILD_APPROVED);
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
      await projectPage.expectVersionMessageContainsText('Here\'s the PR you can share:');
      await projectPage.checkPrLink();
    });
  });
});
