import { http, HttpResponse } from 'msw'
import { API_BASE_URL } from '../utils/constant'

export const Handlers = [
    //Login
    http.post(`${API_BASE_URL}/auth/login`, async ({ request }) => {
        console.log('[MSW] Request URL:', request.url); // debug url thực tế
        const body = await request.json() as { loginName: string, passWord: string };
        console.log('[MSW] Request body:', body); // debug input gửi đi

        const loginName = body.loginName?.trim();
        const passWord = body.passWord?.trim();

        console.log('[MSW] Trimmed loginName:', loginName, 'passWord:', passWord);

        if (loginName === 'testuser' && passWord === 'password123') {
            console.log('[MSW] MATCH SUCCESS!');
            return HttpResponse.json({
                success: true,
                token: 'fake-token-debug',
                message: 'Login successful',
                member: { memberId: '1', memberFullName: 'Test', email: 'test@test.com', loginName: 'testuser', roleId: '1', isActive: true }
            }, { status: 200 });
        }

        console.log('[MSW] NO MATCH - Returning fail');
        return HttpResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    }),

    //Register
    http.post(`${API_BASE_URL}/auth/register`, async ({ request }) => {
        const body = await request.json() as {
            loginName: string; memberFullName: string; email: string; passWord: string;
        };

        if (body.loginName !== 'existinguser' && body.email !== 'existing@email.com'){
            return HttpResponse.json(
                {
                    memberId: 'new123',
                    memberFullName: body.memberFullName,
                    email: body.email,
                    loginName: body.loginName,
                    roleId: 'user',
                    isActive: true,
                },
                { status: 200 }
            );
        }

        return HttpResponse.json(
            { success: false, error: 'Username or email already exists'},
            { status: 400 }
        );
    }),
];