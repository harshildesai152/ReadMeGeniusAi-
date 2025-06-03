
'use server';

/**
 * @fileOverview Summarizes provided code content, detailing its purpose, functionality, and key features.
 *
 * - summarizeCodeContent - A function that summarizes the code.
 * - SummarizeCodeContentInput - The input type for the summarizeCodeContent function.
 * - SummarizeCodeContentOutput - The return type for the summarizeCodeContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeCodeContentInputSchema = z.object({
  codeContent: z.string().describe('The raw code content to be summarized.'),
});
export type SummarizeCodeContentInput = z.infer<typeof SummarizeCodeContentInputSchema>;

const SummarizeCodeContentOutputSchema = z.object({
  summary: z.string().describe('A summary of the code, including its purpose, functionality, and key features.'),
});
export type SummarizeCodeContentOutput = z.infer<typeof SummarizeCodeContentOutputSchema>;

export async function summarizeCodeContent(input: SummarizeCodeContentInput): Promise<SummarizeCodeContentOutput> {
  return summarizeCodeContentFlow(input);
}

const summarizeCodeContentPrompt = ai.definePrompt({
  name: 'summarizeCodeContentPrompt',
  input: {schema: SummarizeCodeContentInputSchema},
  output: {schema: SummarizeCodeContentOutputSchema},
  prompt: `You are an AI expert in understanding code and summarizing its functionality.

  Given the following code content, provide a concise summary of the project's or snippet's purpose, main functionality, and any key features or components evident from the code.
  Make the summary detailed and professional. Focus on what the code *does*.

  Code Content:
  \`\`\`
  {{{codeContent}}}
  \`\`\`
  `,
});

const summarizeCodeContentFlow = ai.defineFlow(
  {
    name: 'summarizeCodeContentFlow',
    inputSchema: SummarizeCodeContentInputSchema,
    outputSchema: SummarizeCodeContentOutputSchema,
  },
  async input => {
    const {output} = await summarizeCodeContentPrompt(input);
    return output!;
  }
);
