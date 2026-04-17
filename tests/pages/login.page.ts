import { expect } from '@playwright/test';

import { AppPage } from '@app-base';
import { Button } from '@app-components/button.component.ts';
import { Constants } from '@app-constants/constants.ts';
import { Input } from '@app-components/input.component.ts';
import { env } from '@app-helpers/base';
import { logStep } from '@app-utils/logStep';
import { ProjectPage } from '@app-pages/projectPage.ts';

export class LoginPage extends AppPage {
  public pagePath: string = `${env('BASE_URL')}/login`;

  public emailInput: Input = new Input(this.page, this.context, 'login-email-input');
  public passwordInput: Input = new Input(this.page, this.context, 'login-password-input');
  public submitButton: Button = new Button(this.page, this.context, 'login-submit-button');

  @logStep('Verify login page is loaded')
  public async expectLoaded(): Promise<void> {
    await expect(this.page, 'Expected Login page to have URL').toHaveURL(/studio\.autonomyai\.io/);
    await this.emailInput.expectInViewport();
  }

  @logStep('Login as user')
  public async login(data: { email: string; password: string }): Promise<void> {
    await this.emailInput.fill(data.email);
    await this.passwordInput.fill(data.password);
    await this.submitButton.click({ timeout: Constants.SIXTY_SECONDS });
  }

  @logStep('Login with saving storage')
  public async loginWithSavingStorage({ email, password, authFilePath }: { email: string; password: string; authFilePath: string }): Promise<void> {
    const studioPage: ProjectPage = new ProjectPage(this.page, this.context);

    await this.open();
    await this.login({ email, password });
    await studioPage.expectLoaded();
    await this.page.context().storageState({ path: authFilePath });
  }
}
