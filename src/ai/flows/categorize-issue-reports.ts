// src/ai/flows/categorize-issue-reports.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for categorizing civic issue reports.
 *
 * It takes a report description and location as input, and suggests relevant issue categories and departments.
 * The flow exports a function categorizeIssueReport, the input type CategorizeIssueReportInput, and the output type CategorizeIssueReportOutput.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CategorizeIssueReportInputSchema = z.object({
  description: z.string().describe('The description of the civic issue.'),
  location: z.string().describe('The location of the civic issue.'),
});
export type CategorizeIssueReportInput = z.infer<typeof CategorizeIssueReportInputSchema>;

const CategorizeIssueReportOutputSchema = z.object({
  category: z.string().describe('The suggested category for the issue.'),
  department: z.string().describe('The suggested department to handle the issue.'),
});
export type CategorizeIssueReportOutput = z.infer<typeof CategorizeIssueReportOutputSchema>;

export async function categorizeIssueReport(input: CategorizeIssueReportInput): Promise<CategorizeIssueReportOutput> {
  return categorizeIssueReportFlow(input);
}

const categorizeIssueReportPrompt = ai.definePrompt({
  name: 'categorizeIssueReportPrompt',
  input: {schema: CategorizeIssueReportInputSchema},
  output: {schema: CategorizeIssueReportOutputSchema},
  prompt: `You are an AI assistant helping to categorize civic issue reports.
  Given the following description and location of a civic issue, suggest the most relevant category and department to handle the issue.

  Description: {{{description}}}
  Location: {{{location}}}

  Category: 
  Department: `,
});

const categorizeIssueReportFlow = ai.defineFlow(
  {
    name: 'categorizeIssueReportFlow',
    inputSchema: CategorizeIssueReportInputSchema,
    outputSchema: CategorizeIssueReportOutputSchema,
  },
  async input => {
    const {output} = await categorizeIssueReportPrompt(input);
    return output!;
  }
);
