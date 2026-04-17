import { Page, Response } from '@playwright/test';

import { GenerationStatusApi, GenerationStepApi } from '@app-types/generation.enums';

export async function waitForGenerationResponse(
  page: Page,
  {
    step,
    generationStatus,
  }: {
    step: GenerationStepApi;
    generationStatus: GenerationStatusApi;
  },
  timeout?: number,
): Promise<Response> {
  return page.waitForResponse(
    async (response: Response) => {
      if (!response.url().includes('/tasks/') || !response.url().includes('after_id=')) {
        return false;
      }

      const body = await response.json();

      return body.task?.status_details?.step === step && body.task?.status_details?.status === generationStatus;
    },
    { timeout },
  );
}

export async function waitForStorybookResponse(page: Page, searchUrl: string, timeout?: number): Promise<Response> {
  return page.waitForResponse(
    async (response: Response) => {
      if (!response.url().includes(searchUrl) || !response.url().includes('/tasks/') || !response.url().includes('/storybook')) {
        return false;
      }

      const body = await response.json();

      return body.dev_server_running === true && body.storybook_url;
    },
    { timeout },
  );
}
