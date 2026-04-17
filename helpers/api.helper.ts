import { Page, Response } from '@playwright/test';

import { GenerationResponseBody, StorybookResponseBody } from '@app-types/apiResponses';
import { GenerationStatusApi, GenerationStepApi } from '@app-types/generation.enums';

async function getResponseBody<T>(response: Response): Promise<T | null> {
  try {
    const body = await response.json();

    if (!body || typeof body !== 'object') {
      return null;
    }

    return body as T;
  } catch {
    return null;
  }
}

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

      const body = await getResponseBody<GenerationResponseBody>(response);

      if (!body) {
        return false;
      }

      return body.task?.status_details?.step === step && body.task?.status_details?.status === generationStatus;
    },
    { timeout },
  );
}

export async function waitForStorybookResponse(page: Page, timeout?: number): Promise<Response> {
  return page.waitForResponse(
    async (response: Response) => {
      if (!response.url().includes('/tasks/') || !response.url().includes('/storybook')) {
        return false;
      }

      if (response.status() !== 200) {
        return false;
      }

      const body = await getResponseBody<StorybookResponseBody>(response);

      return body?.dev_server_running === true && typeof body.storybook_url === 'string' && body.storybook_url.length > 0;
    },
    { timeout },
  );
}
