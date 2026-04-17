export enum GenerationStepApi {
  PLANNING = 'planning',
  CODE_GENERATION = 'code_generation',
  PRE_PR = 'pre_pr',
}

export enum GenerationStatusApi {
  PENDING = 'pending',
}

export enum TimelinePhase {
  PLANNING = 'Planning',
  CODE_GENERATION = 'Code Generation',
  PRE_PR = 'Pre Pr',
}

export enum TimeLineStatus {
  COMPLETED = 'Completed',
  RUNNING_STEP = 'Running step',
}

export enum TaskMessageBubbleText {
  GENERATE_PROMPT = 'update all fonts to Poppins',
  BUILD_APPROVED = 'Plan approved. Let\'s make it real!',
  SEND_TO_DEVS = 'Review my changes, clean up the code for production, and send as a pull request',
}
