
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
  repoUrl: z.string().optional().describe('The URL of the GitHub repository (if applicable).'),
  fileContents: z.string().describe('Either a small, representative, and generic sample of project file structure OR actual code content. This is not necessarily the entire codebase.'),
  projectName: z.string().describe('The name of the project.'),
  projectDescription: z.string().describe('The high-level description of the project, its purpose, and main functionalities.'),
});

export type GenerateReadmeSectionsInput = z.infer<typeof GenerateReadmeSectionsInputSchema>;

const GenerateReadmeSectionsOutputSchema = z.object({
  features: z.string().describe('A list of key features of the project, derived from its description and sample code. For e-commerce, include admin features if hinted. For portfolios, focus on showcased elements.'),
  technologiesUsed: z.string().describe('A list of primary programming languages, frameworks, and key libraries. This list should be based *strongly* on the "Project Description" and any specific technologies visible in "Sample Code Contents" if it contains actual code. If "Sample Code Contents" is a generic structure, rely primarily on the Project Description. If the Project Description is vague, list only unambiguously stated technologies. If none are clear, state that technologies are not clearly specified.'),
  setupInstructions: z.string().describe('Detailed, step-by-step instructions on how to set up and run the project locally, assuming a novice developer. If "Sample Code Contents" is actual code, try to infer setup steps if common patterns (like package.json, requirements.txt) are implied. If it is a generic structure or repoUrl is provided, provide generic setup instructions.'),
  folderStructure: z.string().describe('A representation of the project\'s folder structure. If "Sample Code Contents" is actual code or a very small snippet, state "Folder structure is not applicable for direct code input or limited snippet." Otherwise, derive from the provided structural example.'),
});

export type GenerateReadmeSectionsOutput = z.infer<typeof GenerateReadmeSectionsOutputSchema>;

export async function generateReadmeSections(input: GenerateReadmeSectionsInput): Promise<GenerateReadmeSectionsOutput> {
  return generateReadmeSectionsFlow(input);
}

const generateReadmeSectionsPrompt = ai.definePrompt({
  name: 'generateReadmeSectionsPrompt',
  input: {schema: GenerateReadmeSectionsInputSchema},
  output: {schema: GenerateReadmeSectionsOutputSchema},
  prompt: `You are an AI assistant helping generate sections for a README file.

  Project Name: {{{projectName}}}
  Project Description: {{{projectDescription}}}
  {{#if repoUrl}}Repository URL: {{{repoUrl}}}{{/if}}

  Sample Code Contents or File Structure:
  (This might be a *very generic structural example*, actual code, or a snippet. Adapt your interpretation accordingly.)
  \`\`\`
  {{{fileContents}}}
  \`\`\`

  Generate the following sections for the README file:

  - Features: Based on the project description and any provided code/structure, identify and list the key features. For e-commerce projects, include admin-specific features if hinted. For portfolio projects, focus on elements showcased.

  - Technologies Used:
    List the main programming languages, frameworks, and key libraries.
    Base your list *strongly* on the "Project Description".
    If "Sample Code Contents" contains actual, specific programming code, use it as a strong secondary source to confirm or identify technologies.
    If "Sample Code Contents" is a *very generic structural example* (e.g., just filenames like 'main_module.file_extension'), do *not* infer specific technologies from it unless they are also strongly supported by the Project Description.
    If the Project Description is vague about technologies, list only what is unambiguously stated or extremely obvious from actual code (if provided).
    Do NOT guess or list "likely" or "common" technologies for a project type unless directly supported by the Project Description or visible in actual code. Prioritize accuracy and be conservative. If no specific technologies can be confidently identified, state that the technologies are not clearly specified.

  - Setup Instructions: Provide detailed, step-by-step instructions on how to set up and run this project locally. Assume the user is a novice developer.
    If "Sample Code Contents" is actual code that implies a build system (e.g., package.json, requirements.txt, pom.xml), tailor instructions to that.
    Otherwise (generic structure or just a URL), include generic commands for cloning (if URL provided), dependency installation (e.g., npm install, pip install), environment variable setup (mention .env from .env.example), and running the project (e.g., npm start, python app.py).

  - Folder Structure:
    If "Sample Code Contents" is clearly a generic structural example (listing directories and placeholder file names), represent that structure here.
    If "Sample Code Contents" is actual programming code or a very small snippet, it's often not representative of the whole structure. In this case, output: "Folder structure is not applicable for direct code input or limited snippet."

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
