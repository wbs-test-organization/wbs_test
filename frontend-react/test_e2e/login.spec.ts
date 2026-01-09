import { test, expect } from '@playwright/test';

test.describe('Login Functionality - With Real Backend (Current Component)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');

    // Đợi trang load bằng tiêu đề hoặc button Login (ổn định)
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible({ timeout: 10000 });
  });

  // 1. Không nhập loginName → HTML5 required ngăn submit (không có message "Required")
  test('should not submit when loginName is empty', async ({ page }) => {
    // Chỉ nhập password, bỏ trống username
    await page.getByPlaceholder('Enter password').fill('any-password');
    await page.getByRole('button', { name: 'Login' }).click();

    // Với required HTML5, browser sẽ ngăn submit và focus vào field trống
    // Không có text lỗi, không có class error → chỉ check URL không đổi
    await expect(page).toHaveURL('/login');

    // Bonus: field username được focus (dấu hiệu browser ngăn submit)
    await expect(page.locator('input[name="loginName"]')).toBeFocused();
  });

  // 2. Không nhập password → HTML5 required ngăn submit
  test('should not submit when password is empty', async ({ page }) => {
    await page.getByPlaceholder('Enter username').fill('any-username');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page).toHaveURL('/login');

    // Field password được focus
    await expect(page.locator('input[name="passWord"]')).toBeFocused();
  });

  // 3. Cả hai trống → Browser ngăn submit, focus vào field đầu tiên
  test('should not submit when both fields are empty', async ({ page }) => {
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page).toHaveURL('/login');

    // Browser sẽ focus vào field đầu tiên bị required
    await expect(page.locator('input[name="loginName"]')).toBeFocused();
  });

  // 4. Login thành công → dùng tài khoản THẬT trong DB
  test('should login successfully with valid credentials', async ({ page }) => {
    // <<<--- THAY 2 DÒNG NÀY BẰNG USERNAME + PASSWORD THẬT TRONG DATABASE ---<<<
    await page.getByPlaceholder('Enter username').fill('a');           // ví dụ
    await page.getByPlaceholder('Enter password').fill('123456');       // ví dụ

    await page.getByRole('button', { name: 'Login' }).click();

    // Kiểm tra message thành công từ code của bạn
    await expect(page.locator('.ant-message-notice-content')).toContainText('Login successfully!', { timeout: 10000 });

    // Chờ redirect đến dashboard
    await expect(page).toHaveURL('/dashboard', { timeout: 15000 });
  });

  // 5. Login thất bại → sai username hoặc password
  test('should show error message when login fails', async ({ page }) => {
    await page.getByPlaceholder('Enter username').fill('user-sai-100%');
    await page.getByPlaceholder('Enter password').fill('pass-sai-100%');

    await page.getByRole('button', { name: 'Login' }).click();

    // Message lỗi từ code của bạn
    await expect(page.locator('.ant-message-notice-content')).toContainText('Username or password not match', { timeout: 10000 });

    // Vẫn ở trang login
    await expect(page).toHaveURL('/login');
  });
});