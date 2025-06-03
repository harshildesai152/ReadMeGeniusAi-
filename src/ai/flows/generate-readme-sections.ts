
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
  fileContents: z.string().describe('A small, representative sample of code snippets or file structure descriptions from the repository. This is not the entire codebase.'),
  projectName: z.string().describe('The name of the project.'),
  projectDescription: z.string().describe('The high-level description of the project.'),
});

export type GenerateReadmeSectionsInput = z.infer<typeof GenerateReadmeSectionsInputSchema>;

const GenerateReadmeSectionsOutputSchema = z.object({
  features: z.string().describe('A list of key features of the project, derived from its description and sample code.'),
  technologiesUsed: z.string().describe('A list of primary programming languages, frameworks, and key libraries. This list should be based *strictly* on evidence from the project description and any technologies explicitly visible in the sample code contents. Do not infer or guess technologies not directly supported by these inputs.'),
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
  prompt: `You are an AI assistant helping generate sections for a README file based on information about a GitHub repository.

  Project Name: {{{projectName}}}
  Project Description: {{{projectDescription}}}
  Repository URL: {{{repoUrl}}}
  *Sample* Code Contents (this is a small, representative snippet, not the whole codebase):
  \`\`\`
  {{{fileContents}}}
  \`\`\`

  Generate the following sections for the README file:

  - Features: Based on the project description and the sample code, identify and list the key features of the project. For e-commerce projects, include admin-specific features if hinted (e.g., product management, order tracking). For portfolio projects, focus on elements showcased.

  - Technologies Used: Based *primarily* on the project description and the *explicitly visible technologies in the sample code contents*, list the main programming languages, frameworks, and key libraries. If a technology is not clearly evident from these inputs, do NOT include it. Avoid listing technologies that are merely "likely" or "common" for a project type unless directly supported by the provided information. Be conservative and prioritize accuracy based on the given inputs.

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

