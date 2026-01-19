import '@testing-library/jest-dom';
import '../src/mocks/polyfills'
import { server } from './mocks/server';
import { beforeAll, afterEach, afterAll } from 'vitest';

// Bật MSW trước khi tất cả test chạy
beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));

// Reset handler sau mỗi test riêng lẻ
afterEach(() => server.resetHandlers());

// Tắt MSW sau khi tất cả test hoàn tất
afterAll(() => server.close());