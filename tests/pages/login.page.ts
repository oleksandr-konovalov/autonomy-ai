import { expect } from '@playwright/test';

import { AppPage } from '../abstractClass';
import { Button } from '../components/button.component';
import { Constants } from '../../constants/constants';
import { Input } from '../components/input.component';
import { env } from '../../helpers/base';
import { logStep } from '../../utils/logStep';
import { StudioPage } from '@app-pages/studio.page';

export class LoginPage extends AppPage {
  public pagePath: string = `${env('BASE_URL')}/login`;

  public emailInput: Input = new Input(this.page, this.context, 'login-email-input');
  public passwordInput: Input = new Input(this.page, this.context, 'login-password-input');
  public submitButton: Button = new Button(this.page, this.context, 'login-submit-button');

  public async expectLoaded(): Promise<void> {
    await expect(this.page, 'Expected Login page to have URL').toHaveURL(/studio\.autonomyai\.io/);
    await this.emailInput.expectVisible();
  }

  @logStep('Login as user')
  public async login(data: { email: string; password: string }): Promise<void> {
    await this.emailInput.fill(data.email);
    await this.passwordInput.fill(data.password);
    await this.submitButton.click({ timeout: Constants.SIXTY_SECONDS });
  }

  @logStep('Login with saving storage')
  public async loginWithSavingStorage({ email, password, authFilePath }: { email: string; password: string; authFilePath: string }): Promise<void> {
    const studioPage: StudioPage = new StudioPage(this.page, this.context);

    await this.open();
    await this.login({ email, password });
    await studioPage.expectLoaded();
    await this.page.context().storageState({ path: authFilePath });
  }
}
