'use server';

/**
 * @fileOverview A flow to suggest a project name based on the repository's code and functionality.
 *
 * - suggestProjectName - A function that suggests a project name.
 * - SuggestProjectNameInput - The input type for the suggestProjectName function.
 * - SuggestProjectNameOutput - The return type for the suggestProjectName function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestProjectNameInputSchema = z.object({
  repoDescription: z
    .string()
    .describe('The high level description of the github repo.'),
  repoLanguages: z
    .string()
    .describe("List of languages used in this repo. Example: 'Typescript, Python, Java'"),
});
export type SuggestProjectNameInput = z.infer<typeof SuggestProjectNameInputSchema>;

const SuggestProjectNameOutputSchema = z.object({
  projectName: z.string().describe('A creative and relevant project name suggestion.'),
});
export type SuggestProjectNameOutput = z.infer<typeof SuggestProjectNameOutputSchema>;

export async function suggestProjectName(input: SuggestProjectNameInput): Promise<SuggestProjectNameOutput> {
  return suggestProjectNameFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestProjectNamePrompt',
  input: {schema: SuggestProjectNameInputSchema},
  output: {schema: SuggestProjectNameOutputSchema},
  prompt: `You are a creative project name generator.

  Based on the description and languages of the project, suggest a relevant and catchy name for the project.

  Description: {{{repoDescription}}}
  Languages: {{{repoLanguages}}}

  Please suggest a project name:
  `,
});

const suggestProjectNameFlow = ai.defineFlow(
  {
    name: 'suggestProjectNameFlow',
    inputSchema: SuggestProjectNameInputSchema,
    outputSchema: SuggestProjectNameOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
