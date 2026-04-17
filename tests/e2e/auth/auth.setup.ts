import { LoginPage } from '@app-pages/login.page';
import { baseFixture as setup } from '@app-fixtures';
import { env } from '@app-helpers/base';
import { isTokenExistAndValidByTime } from '@app-helpers/auth.helper';

const authFilePath: string = `tests/.auth/${env('TEST_EMAIL')}.json`;

setup('authenticate as User', { tag: '@userLogin' }, async ({ loginPage }: { loginPage: LoginPage }): Promise<void> => {
  if (isTokenExistAndValidByTime(authFilePath)) {
    return;
  }

  await loginPage.loginWithSavingStorage({
    email: env('TEST_EMAIL'),
    password: env('TEST_PASSWORD'),
    authFilePath,
  });
});
