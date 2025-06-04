
'use server';

/**
 * @fileOverview A flow to generate a full README.md content based on a user's textual prompt.
 *
 * - generateReadmeFromPrompt - A function that generates all README sections from a prompt.
 * - GenerateReadmeFromPromptInput - The input type for the function.
 * - GenerateReadmeFromPromptOutput - The return type for the function (matches FullReadmeData).
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateReadmeFromPromptInputSchema = z.object({
  userPrompt: z.string().describe('A textual prompt describing the project, its purpose, functionalities, and any known technologies. The AI will use this to generate all README sections.'),
});
export type GenerateReadmeFromPromptInput = z.infer<typeof GenerateReadmeFromPromptInputSchema>;

// This output schema should match the FullReadmeData structure
const GenerateReadmeFromPromptOutputSchema = z.object({
  projectName: z.string().describe('A suitable project name derived from the prompt.'),
  projectDescription: z.string().describe('A detailed project description based on the prompt.'),
  features: z.string().describe('A list of key features inferred or extracted from the prompt. If not clear, list potential features based on the project type mentioned.'),
  technologiesUsed: z.string().describe('A list of primary programming languages, frameworks, and key libraries mentioned or strongly implied in the prompt. If none are clear, state that technologies are not specified in the prompt.'),
  setupInstructions: z.string().describe('Generic, step-by-step instructions on how to set up and run a typical project. If the prompt gives clues (e.g., "Node.js app"), tailor slightly. Otherwise, provide very general steps like cloning, installing dependencies (e.g. `npm install`, `pip install`), configuring environment, and running.'),
  folderStructure: z.string().describe('A generic, representative folder structure for a typical project of the type described in the prompt. If the project type is unclear, provide a very basic structure (e.g., src/, docs/, tests/). If the prompt is too abstract, state "Folder structure cannot be determined from the prompt alone."'),
});
export type GenerateReadmeFromPromptOutput = z.infer<typeof GenerateReadmeFromPromptOutputSchema>;

export async function generateReadmeFromPrompt(input: GenerateReadmeFromPromptInput): Promise<GenerateReadmeFromPromptOutput> {
  return generateReadmeFromPromptFlow(input);
}

const readmeGenerationPrompt = ai.definePrompt({
  name: 'generateReadmeFromPromptPrompt',
  input: {schema: GenerateReadmeFromPromptInputSchema},
  output: {schema: GenerateReadmeFromPromptOutputSchema},
  prompt: `You are an AI assistant tasked with generating a complete README.md file content based *solely* on the user's provided textual prompt.

User Prompt:
{{{userPrompt}}}

Based on this prompt, generate the following sections for the README:

1.  **Project Name:** Create a concise and suitable project name.
2.  **Project Description:** Write a comprehensive description of what the project is, its purpose, and main goals, as understood from the prompt.
3.  **Features:** List the key features. If the prompt is abstract, infer potential features common to the type of project described.
4.  **Technologies Used:**
    *   Identify programming languages, frameworks, or major libraries explicitly mentioned or very strongly implied in the prompt.
    *   Do NOT guess or list "likely" technologies for a project type unless the prompt provides a clear indication.
    *   If no technologies are clearly specified, state: "Technologies are not specified in the prompt."
5.  **Setup Instructions:**
    *   Provide generic, step-by-step setup instructions suitable for a novice developer.
    *   If the prompt hints at a specific technology stack (e.g., "a Python Django web app"), you can slightly tailor generic commands (e.g., mention \`pip install -r requirements.txt\`, \`python manage.py runserver\`).
    *   Otherwise, stick to very general instructions:
        1.  Clone the repository: \`git clone <repository-url>\` (mention this even if no URL is given, as it's standard)
        2.  Navigate to the project directory: \`cd <project-name>\`
        3.  Install dependencies: (e.g., \`npm install\`, \`pip install -r requirements.txt\`, or "Install necessary dependencies as per the project's package manager.")
        4.  Configure environment variables: "Create a \`.env\` file from \`.env.example\` (if provided) and fill in necessary credentials/configurations."
        5.  Run the application: (e.g., \`npm start\`, \`python app.py\`, or "Execute the main script or run the development server.")
6.  **Folder Structure:**
    *   If the prompt gives clues about the project type (e.g., "web application", "mobile app", "library"), provide a *very generic but representative* folder structure for that type of project using a simple tree-like format.
        Example for a generic web app:
        \`\`\`
        project-root/
        ├── src/
        │   ├── components/
        │   ├── pages/ or views/
        │   └── App.js or main.py
        ├── public/ or static/
        │   └── index.html
        ├── tests/
        ├── README.md
        └── package.json or requirements.txt
        \`\`\`
    *   If the project type is too vague or the prompt too abstract, state: "A standard folder structure would apply, typically including src/, tests/, and documentation. Specifics cannot be determined from the prompt alone."

Ensure all sections are well-formatted (Markdown where appropriate, especially for lists and code blocks in setup instructions).
The output must be a JSON object matching the defined output schema.
`,
});

const generateReadmeFromPromptFlow = ai.defineFlow(
  {
    name: 'generateReadmeFromPromptFlow',
    inputSchema: GenerateReadmeFromPromptInputSchema,
    outputSchema: GenerateReadmeFromPromptOutputSchema,
  },
  async (input) => {
    const {output} = await readmeGenerationPrompt(input);
    if (!output) {
      throw new Error('AI failed to generate README content from the prompt.');
    }
    return output;
  }
);
