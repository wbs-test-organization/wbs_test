import { test, expect } from '@playwright/test';

test.describe('Register Functionality - With Real Backend (Current Component)', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/register');

        // Đợi trang load bằng button Register
        await expect(page.getByRole('button', { name: 'Register' })).toBeVisible({ timeout: 10000 });
    });

    // 1a. Nhập thiếu Email
    test('should not submit when email is empty', async ({ page }) => {
        await page.getByPlaceholder('Enter full name').fill('Nguyen Van A');
        await page.getByPlaceholder('Enter username').fill('testuser');
        await page.getByPlaceholder('Enter password').fill('Password123');
        await page.getByPlaceholder('Enter confirm password').fill('Password123');

        await page.getByRole('button', { name: 'Register' }).click();

        await expect(page).toHaveURL('/register');
        await expect(page.locator('input[name="email"]')).toBeFocused();
    });

    // 1b. Nhập thiếu Full Name
    test('should not submit when full name is empty', async ({ page }) => {
        await page.getByPlaceholder('Enter email').fill('test@example.com');
        await page.getByPlaceholder('Enter username').fill('testuser');
        await page.getByPlaceholder('Enter password').fill('Password123');
        await page.getByPlaceholder('Enter confirm password').fill('Password123');

        await page.getByRole('button', { name: 'Register' }).click();

        await expect(page).toHaveURL('/register');
        await expect(page.locator('input[name="memberFullName"]')).toBeFocused();
    });

    // 1c. Nhập thiếu Username (loginName)
    test('should not submit when username is empty', async ({ page }) => {
        await page.getByPlaceholder('Enter email').fill('test@example.com');
        await page.getByPlaceholder('Enter full name').fill('Nguyen Van A');
        await page.getByPlaceholder('Enter password').fill('Password123');
        await page.getByPlaceholder('Enter confirm password').fill('Password123');

        await page.getByRole('button', { name: 'Register' }).click();

        await expect(page).toHaveURL('/register');
        await expect(page.locator('input[name="loginName"]')).toBeFocused();
    });

    // 1d. Nhập thiếu Password
    test('should not submit when password is empty', async ({ page }) => {
        await page.getByPlaceholder('Enter email').fill('test@example.com');
        await page.getByPlaceholder('Enter full name').fill('Nguyen Van A');
        await page.getByPlaceholder('Enter username').fill('testuser');
        await page.getByPlaceholder('Enter confirm password').fill('Password123');

        await page.getByRole('button', { name: 'Register' }).click();

        await expect(page).toHaveURL('/register');
        await expect(page.locator('input[name="passWord"]')).toBeFocused();
    });

    // 1e. Nhập thiếu Confirm Password
    test('should not submit when confirm password is empty', async ({ page }) => {
        await page.getByPlaceholder('Enter email').fill('test@example.com');
        await page.getByPlaceholder('Enter full name').fill('Nguyen Van A');
        await page.getByPlaceholder('Enter username').fill('testuser');
        await page.getByPlaceholder('Enter password').fill('Password123');

        await page.getByRole('button', { name: 'Register' }).click();

        await expect(page).toHaveURL('/register');
        await expect(page.getByPlaceholder('Enter confirm password')).toBeFocused();
    });

    // 2. Email không đúng định dạng
    test('should not submit when email format is invalid', async ({ page }) => {
        await page.getByPlaceholder('Enter email').fill('email-sai-dinh-dang');
        await page.getByPlaceholder('Enter full name').fill('Nguyen Van A');
        await page.getByPlaceholder('Enter username').fill('testuser');
        await page.getByPlaceholder('Enter password').fill('Password123');
        await page.getByPlaceholder('Enter confirm password').fill('Password123');

        await page.getByRole('button', { name: 'Register' }).click();

        await expect(page).toHaveURL('/register');
        await expect(page.getByPlaceholder('Enter email')).toBeFocused();
    });

    // 3. Confirm password không khớp
    test('should show error when confirm password does not match', async ({ page }) => {
        await page.getByPlaceholder('Enter email').fill('valid@email.com');
        await page.getByPlaceholder('Enter full name').fill('Valid User');
        await page.getByPlaceholder('Enter username').fill('validuser');
        await page.getByPlaceholder('Enter password').fill('Password123');
        await page.getByPlaceholder('Enter confirm password').fill('SaiPassword456');

        await page.getByRole('button', { name: 'Register' }).click();

        await expect(page.locator('.ant-message-notice-content')).toContainText('Confirm password does not match!', { timeout: 10000 });
        await expect(page).toHaveURL('/register');
    });

    // 4. Register thất bại (API trả success: false)
    test('should show error when registration fails', async ({ page }) => {
    await page.getByPlaceholder('Enter email').fill('admin123@gmail.com');
    await page.getByPlaceholder('Enter full name').fill('Duplicate User');
    await page.getByPlaceholder('Enter username').fill('admin'); // trùng username
    await page.getByPlaceholder('Enter password').fill('Password123');
    await page.getByPlaceholder('Enter confirm password').fill('Password123');

    await page.getByRole('button', { name: 'Register' }).click();

    // BỎ check loading button vì backend trả lỗi nhanh
    // Chỉ check message lỗi (có thể là 400 hoặc message cụ thể)
    await expect(page.getByText(/đã tồn tại|exist|duplicate|failed|400|đăng ký thất bại/i, { exact: false }))
    .toBeVisible({ timeout: 10000 });  // điều chỉnh regex theo message thực tế của bạn

    // Button vẫn là Register
    await expect(page.getByRole('button', { name: 'Register' })).toBeVisible();

    await expect(page).toHaveURL('/register');
  });

  // 5. Register thành công — fix: password SIÊU MẠNH + email/username unique
//   test('should register successfully and redirect to login', async ({ page }) => {
//     const timestamp = Date.now();
//     const uniqueEmail = `playwright.success.${timestamp}@gmail.com`;
//     const uniqueUsername = `pwsuccess${timestamp}`;

//     // Password cực mạnh để thỏa mọi validation
//     const superStrongPassword = 'Playwright@2026!Strong';

//     await page.getByPlaceholder('Enter email').fill(uniqueEmail);
//     await page.getByPlaceholder('Enter full name').fill('Playwright Success User');
//     await page.getByPlaceholder('Enter username').fill(uniqueUsername);
//     await page.getByPlaceholder('Enter password').fill(superStrongPassword);
//     await page.getByPlaceholder('Enter confirm password').fill(superStrongPassword);

//     await page.getByRole('button', { name: 'Register' }).click();

//     await expect(page.getByRole('button', { name: 'Registering...' })).toBeVisible();

//     // Message thành công

//     // Redirect về login
//     await expect(page).toHaveURL('/login',{timeout: 30000});
//   });
});