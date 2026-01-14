import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/unittest/setupTests.ts',
    
    coverage: {
      enabled: true,
      provider: 'v8', 
      reporter: ['text', 'json', 'html', 'lcov'], 
      reportsDirectory: './coverage',
      include: ['src/**/*.{ts,tsx,js,jsx}'],
      exclude: ['node_modules/**', 'dist/**', '**/*.test.ts']
    },
  },
})