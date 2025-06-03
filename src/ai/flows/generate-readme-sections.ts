
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
  fileContents: z.string().describe('The contents of representative files in the repository, concatenated into one string.'),
  projectName: z.string().describe('The name of the project.'),
  projectDescription: z.string().describe('The high-level description of the project.'),
});

export type GenerateReadmeSectionsInput = z.infer<typeof GenerateReadmeSectionsInputSchema>;

const GenerateReadmeSectionsOutputSchema = z.object({
  features: z.string().describe('A list of key features of the project, derived from its description and code.'),
  technologiesUsed: z.string().describe('A list of primary programming languages, frameworks, and key libraries inferred from the project name, description, and provided code contents.'),
  setupInstructions: z.string().describe('Detailed, step-by-step instructions on how to set up and run the project locally, assuming a novice developer.'),
});

export type GenerateReadmeSectionsOutput = z.infer<typeof GenerateReadmeSectionsOutputSchema>;

export async function generateReadmeSections(input: GenerateReadmeSectionsInput): Promise<GenerateReadmeSectionsOutput> {
  return generateReadmeSectionsFlow(input);
}

const generateReadmeSectionsPrompt = ai.definePrompt({
  name: 'generateReadmeSectionsPrompt',
  input: {schema: GenerateReadmeSectionsInputSchema},
  output: {schema: GenerateReadmeSectionsOutputSchema},
  prompt: `You are an AI assistant helping generate sections for a README file based on the code and description of a GitHub repository.

  Project Name: {{{projectName}}}
  Project Description: {{{projectDescription}}}
  Repository URL: {{{repoUrl}}}
  Representative Code Contents:
  \`\`\`
  {{{fileContents}}}
  \`\`\`

  Generate the following sections for the README file:

  - Features: Based on the project description and code, identify and list the key features of the project.
  - Technologies Used: Based on the project name, project description, and the provided representative code contents, list the primary programming languages, frameworks, and key libraries that appear to be used. If the code contents are brief or generic, list common technologies appropriate for a project of this type and name.
  - Setup Instructions: Provide detailed, step-by-step instructions on how to set up and run this project locally. Assume the user is a novice developer. Include commands for cloning, dependency installation (e.g., npm install, pip install), environment variable setup (if typically needed for such a project), and running the project.

  Output the sections in markdown format. Ensure the "Setup Instructions" are comprehensive and easy to follow.
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
