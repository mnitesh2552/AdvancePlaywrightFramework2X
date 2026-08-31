import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

import { captureScreenshot, captureTrace, captureVideo } from './src/config/reportConfig';

/** Strip accidental markdown-link formatting, e.g. `[https://x.com](https://x.com/)`. */
function sanitizeURL(value: string): string {
  const match = value.match(/\[(https?:\/\/[^\]]+)\]/);
  return (match ? match[1] : value).trim().replace(/\/+$/, '');
}

function resolveBaseURL(): string {
  const candidates = [
    process.env.BASE_URL,
    process.env.QA_BASE_URL,
    process.env.STG_BASE_URL,
    process.env.PROD_BASE_URL,
    process.env.DEV_BASE_URL,
    process.env.API_BASE_URL,
  ];
  for (const candidate of candidates) {
    if (!candidate) continue;
    const cleaned = sanitizeURL(candidate);
    if (/^https?:\/\/.+/i.test(cleaned)) return cleaned;
  }
  const env = (process.env.TTA_ENV || 'qa').toLowerCase();
  switch (env) {
    case 'api':
      return 'https://restful-booker.herokuapp.com';
    case 'dev':
    case 'local':
      return 'http://localhost:3000';
    case 'stg':
    case 'stage':
    case 'staging':
      return 'https://stage.thetestingacademy.com';
    case 'prod':
    case 'production':
      return 'https://app.thetestingacademy.com';
    case 'qa':
    default:
      return 'https://app.thetestingacademy.com';
  }
}


export default defineConfig({
  testDir: './src/tests',

  timeout: 60_000,

  expect: {
    timeout: 10_000
  },

  fullyParallel: true,

  retries: process.env.CI ? 2 : 0,

  reporter: [
    ['html'],
    ['list'],
    ['./src/utils/CustomReporter.ts'],
  ],

  use: {
    baseURL: resolveBaseURL(),
    screenshot: captureScreenshot,
    video: captureVideo,
    trace: captureTrace
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome']
      }
    }
  ]
});