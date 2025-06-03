// SummarizeRepo story implementation
'use server';
/**
 * @fileOverview Summarizes a GitHub repository's purpose, functionality, and key features.
 *
 * - summarizeRepo - A function that summarizes the repo.
 * - SummarizeRepoInput - The input type for the summarizeRepo function.
 * - SummarizeRepoOutput - The return type for the summarizeRepo function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeRepoInputSchema = z.object({
  repoUrl: z.string().describe('The URL of the GitHub repository.'),
});
export type SummarizeRepoInput = z.infer<typeof SummarizeRepoInputSchema>;

const SummarizeRepoOutputSchema = z.object({
  summary: z.string().describe('A summary of the repository.'),
});
export type SummarizeRepoOutput = z.infer<typeof SummarizeRepoOutputSchema>;

export async function summarizeRepo(input: SummarizeRepoInput): Promise<SummarizeRepoOutput> {
  return summarizeRepoFlow(input);
}

const summarizeRepoPrompt = ai.definePrompt({
  name: 'summarizeRepoPrompt',
  input: {schema: SummarizeRepoInputSchema},
  output: {schema: SummarizeRepoOutputSchema},
  prompt: `You are an AI expert in understanding code and summarizing code repositories.

  Given the URL of a GitHub repository, summarize the project's purpose, functionality, and key features.
  Make the summary detailed and professional.

  GitHub Repository URL: {{{repoUrl}}}`,
});

const summarizeRepoFlow = ai.defineFlow(
  {
    name: 'summarizeRepoFlow',
    inputSchema: SummarizeRepoInputSchema,
    outputSchema: SummarizeRepoOutputSchema,
  },
  async input => {
    const {output} = await summarizeRepoPrompt(input);
    return output!;
  }
);
