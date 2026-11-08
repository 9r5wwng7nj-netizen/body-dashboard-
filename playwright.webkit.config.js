import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests', testMatch: ['web-hosted.spec.js', 'workout-spacing.spec.js', 'simple-navigation.spec.js', 'approved-training.spec.js', 'approved-nutrition.spec.js', 'approved-preservation.spec.js', 'approved-layout.spec.js', 'exercise-cues.spec.js'], timeout: 60_000,
  workers: 1, retries: 0, reporter: 'list',
  use: { ...devices['iPhone 13'], browserName: 'webkit', viewport: { width: 390, height: 844 } },
});
