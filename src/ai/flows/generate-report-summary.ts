'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a short summary of an issue report.
 *
 * It includes:
 * - generateReportSummary - The function to generate the report summary.
 * - GenerateReportSummaryInput - The input type for the function.
 * - GenerateReportSummaryOutput - The output type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateReportSummaryInputSchema = z.object({
  reportText: z.string().describe('The full text of the issue report.'),
});
export type GenerateReportSummaryInput = z.infer<
  typeof GenerateReportSummaryInputSchema
>;

const GenerateReportSummaryOutputSchema = z.object({
  summary: z.string().describe('A short summary of the issue report.'),
});
export type GenerateReportSummaryOutput = z.infer<
  typeof GenerateReportSummaryOutputSchema
>;

export async function generateReportSummary(
  input: GenerateReportSummaryInput
): Promise<GenerateReportSummaryOutput> {
  return generateReportSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateReportSummaryPrompt',
  input: {schema: GenerateReportSummaryInputSchema},
  output: {schema: GenerateReportSummaryOutputSchema},
  prompt: `You are an expert at summarizing civic issue reports.

  Generate a short, one-sentence summary of the following report:

  Report: {{{reportText}}}
  `,
});

const generateReportSummaryFlow = ai.defineFlow(
  {
    name: 'generateReportSummaryFlow',
    inputSchema: GenerateReportSummaryInputSchema,
    outputSchema: GenerateReportSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return {
      ...output,
    };
  }
);
