
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
  fileContents: z.string().describe('A small, representative, and generic sample of project file structure. This is not the entire codebase and likely does not contain specific programming language code.'),
  projectName: z.string().describe('The name of the project.'),
  projectDescription: z.string().describe('The high-level description of the project, its purpose, and main functionalities.'),
});

export type GenerateReadmeSectionsInput = z.infer<typeof GenerateReadmeSectionsInputSchema>;

const GenerateReadmeSectionsOutputSchema = z.object({
  features: z.string().describe('A list of key features of the project, derived from its description. For e-commerce, include admin features if hinted. For portfolios, focus on showcased elements.'),
  technologiesUsed: z.string().describe('A list of primary programming languages, frameworks, and key libraries. This list should be based *strongly and almost exclusively* on the "Project Description". The "Sample Code Contents" is very generic and should generally NOT be used to infer specific technologies unless they are also clearly supported by the Project Description. If the Project Description is vague, list only unambiguously stated technologies. If none are clear, state that technologies are not clearly specified.'),
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
  Sample Code Contents (this is a *very generic structural example*, not specific code):
  \`\`\`
  {{{fileContents}}}
  \`\`\`

  Generate the following sections for the README file:

  - Features: Based on the project description, identify and list the key features of the project. For e-commerce projects, include admin-specific features if hinted (e.g., product management, order tracking). For portfolio projects, focus on elements showcased.

  - Technologies Used:
    List the main programming languages, frameworks, and key libraries.
    Base your list *strongly and almost exclusively* on the provided "Project Description".
    The "Sample Code Contents" provided is a *very generic structural example* and likely does *not* contain specific code that reveals actual technologies; *do not infer technologies from it unless they are also strongly supported by the Project Description*.
    If the Project Description is vague about technologies, list only what is unambiguously stated or extremely obvious (e.g., "web project" might imply HTML/CSS/JS if no other details are given, but be very cautious).
    Do NOT guess or list "likely" or "common" technologies for a project type unless directly supported by the Project Description. Prioritize accuracy and be conservative. If no specific technologies can be confidently identified from the Project Description, state that the technologies are not clearly specified in the provided information.

  - Setup Instructions: Provide detailed, step-by-step instructions on how to set up and run this project locally. Assume the user is a novice developer. Include commands for cloning, dependency installation (e.g., npm install, pip install, yarn install, bundle install), environment variable setup (if typically needed for such a project, mention creating a .env file from .env.example if present), and running the project (e.g., npm start, python app.py, rails server).

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

