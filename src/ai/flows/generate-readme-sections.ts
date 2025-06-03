'use server';

/**
 * @fileOverview A flow to generate README sections for a project.
 *
 * - generateReadmeSections - A function that generates README sections.
 * - GenerateReadmeSectionsInput - The input type for the generateReadmeSections function.
 * - GenerateReadmeSectionsOutput - The return type for the generateReadmeSections function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateReadmeSectionsInputSchema = z.object({
  repoUrl: z.string().describe('The URL of the GitHub repository.'),
  fileContents: z.string().describe('The contents of all files in the repository, concatenated into one string.'),
  projectName: z.string().describe('The name of the project.'),
});

export type GenerateReadmeSectionsInput = z.infer<typeof GenerateReadmeSectionsInputSchema>;

const GenerateReadmeSectionsOutputSchema = z.object({
  features: z.string().describe('A list of features of the project.'),
  technologiesUsed: z.string().describe('A list of technologies used in the project.'),
  setupInstructions: z.string().describe('Instructions on how to set up the project.'),
});

export type GenerateReadmeSectionsOutput = z.infer<typeof GenerateReadmeSectionsOutputSchema>;

export async function generateReadmeSections(input: GenerateReadmeSectionsInput): Promise<GenerateReadmeSectionsOutput> {
  return generateReadmeSectionsFlow(input);
}

const generateReadmeSectionsPrompt = ai.definePrompt({
  name: 'generateReadmeSectionsPrompt',
  input: {schema: GenerateReadmeSectionsInputSchema},
  output: {schema: GenerateReadmeSectionsOutputSchema},
  prompt: `You are an AI assistant helping generate sections for a README file based on the code in a GitHub repository.

  Project Name: {{{projectName}}}
  Repository URL: {{{repoUrl}}}
  Code Contents: {{{fileContents}}}

  Generate the following sections for the README file:

  - Features: A list of features of the project.
  - Technologies Used: A list of technologies used in the project.
  - Setup Instructions: Instructions on how to set up the project.

  Make the setup instructions very detailed, assuming the user is a novice developer.

  Output the sections in markdown format.
`,
});

const generateReadmeSectionsFlow = ai.defineFlow(
  {
    name: 'generateReadmeSectionsFlow',
    inputSchema: GenerateReadmeSectionsInputSchema,
    outputSchema: GenerateReadmeSectionsOutputSchema,
  },
  async input => {
    const {output} = await generateReadmeSectionsPrompt(input);
    return output!;
  }
);
