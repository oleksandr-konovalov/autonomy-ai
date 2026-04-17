export interface GenerationResponseBody {
  task: {
    status_details: {
      step: string;
      status: string;
    };
  };
}

export interface StorybookResponseBody {
  dev_server_running: boolean;
  storybook_url: string;
}
