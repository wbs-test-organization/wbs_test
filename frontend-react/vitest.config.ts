import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts', './src/unittest/setupTests.ts'],
    exclude: ['node_modules/**', 'dist/**', '**/test_e2e/**', '**/*.spec.ts'],
    
    coverage: {
      enabled: true,
      provider: 'v8', 
      reporter: ['text', 'json', 'html','json-summary', 'lcov'], 
      reportsDirectory: './coverage',
      include: ['src/**/*.{tsx,js,jsx}'],
      exclude: ['node_modules/**', 'dist/**', '**/*.test.ts', '**/*.spec.{ts,tsx}', '**/test_e2e/**']
    },
  },
})