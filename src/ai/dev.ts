import { config } from 'dotenv';
config();

import '@/ai/flows/categorize-issue-reports.ts';
import '@/ai/flows/generate-report-summary.ts';