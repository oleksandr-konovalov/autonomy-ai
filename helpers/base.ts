import { EnvVars } from '@app-types/envVars';

export function env(key: EnvVars): string {
  const value: string = process.env[key];
  if (!value) {
    throw Error(`No environment variable found for ${key}`);
  }

  return value;
}
