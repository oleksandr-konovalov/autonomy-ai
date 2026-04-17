import { LoginPage } from '@app-pages/login.page';
import { baseFixture as setup } from '../../fixtures';
import { env } from '@app-helpers/base';
import { isTokenExistAndValidByTime } from '@app-helpers/auth.helper';

const authFilePath: string = `tests/.auth/${env('USER_EMAIL')}.json`;

setup('authenticate as User', { tag: '@userLogin' }, async ({ loginPage }: { loginPage: LoginPage }): Promise<void> => {
  if (isTokenExistAndValidByTime(authFilePath)) {
    return;
  }

  await loginPage.loginWithSavingStorage({
    email: env('USER_EMAIL'),
    password: env('USER_PASSWORD'),
    authFilePath,
  });
});
