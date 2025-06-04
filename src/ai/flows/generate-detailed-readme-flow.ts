
'use server';

/**
 * @fileOverview A flow to generate a more detailed version of an existing README.
 *
 * - generateDetailedReadmeFlow - A function that takes existing README sections and expands them.
 * - GenerateDetailedReadmeInput - The input type for the function.
 * - GenerateDetailedReadmeOutput - The return type for the function (matches FullReadmeData).
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDetailedReadmeInputSchema = z.object({
  projectName: z.string().describe("The original project name. This should generally remain the same unless refinement is explicitly needed."),
  projectDescription: z.string().describe("The original project description to be potentially expanded or refined."),
  currentFeatures: z.string().describe("The current 'Features' section content to be expanded with more detail, sub-features, or examples."),
  currentTechnologiesUsed: z.string().describe("The current 'Technologies Used' section content to be expanded, perhaps explaining choices or describing tech briefly."),
  currentSetupInstructions: z.string().describe("The current 'Setup Instructions' section content to be expanded with more context, troubleshooting, or alternative steps."),
  currentFolderStructure: z.string().describe("The current 'Folder Structure' section content to be expanded, perhaps explaining key directory purposes."),
});
export type GenerateDetailedReadmeInput = z.infer<typeof GenerateDetailedReadmeInputSchema>;

// This output schema should match the FullReadmeData structure
const GenerateDetailedReadmeOutputSchema = z.object({
  projectName: z.string().describe('A suitable project name, possibly refined but likely the same as input.'),
  projectDescription: z.string().describe('A more detailed and comprehensive project description based on the original.'),
  features: z.string().describe('An expanded list of key features, with more detail, sub-features, or examples based on the current features.'),
  technologiesUsed: z.string().describe('An expanded list of technologies, potentially with brief explanations or reasons for their use, based on the current list.'),
  setupInstructions: z.string().describe('More detailed and comprehensive step-by-step setup instructions, possibly including troubleshooting tips or more context, based on the current instructions.'),
  folderStructure: z.string().describe('A more detailed or better-explained folder structure, potentially clarifying the purpose of key directories, based on the current structure.'),
});
export type GenerateDetailedReadmeOutput = z.infer<typeof GenerateDetailedReadmeOutputSchema>;

// Exported function to be called by server actions
export async function generateDetailedReadme(input: GenerateDetailedReadmeInput): Promise<GenerateDetailedReadmeOutput> {
  return generateDetailedReadmeFlow(input);
}

const detailedReadmePrompt = ai.definePrompt({
  name: 'generateDetailedReadmePrompt',
  input: {schema: GenerateDetailedReadmeInputSchema},
  output: {schema: GenerateDetailedReadmeOutputSchema},
  prompt: `You are an AI assistant tasked with significantly expanding and adding more detail to an existing README.md's content.
The user will provide the current sections of their README. Your goal is to regenerate each section to be more comprehensive, descriptive, and helpful.

Original Project Name: {{{projectName}}}
Original Project Description:
{{{projectDescription}}}

Current 'Features' Section:
{{{currentFeatures}}}

Current 'Technologies Used' Section:
{{{currentTechnologiesUsed}}}

Current 'Setup Instructions' Section:
{{{currentSetupInstructions}}}

Current 'Folder Structure' Section:
{{{currentFolderStructure}}}

Based on the information above, please generate a new, more detailed version for each of the following README sections:
1.  **Project Name:** (Usually keep this the same as the original project name, unless the description strongly suggests a refinement is needed. If so, make a subtle, logical refinement.)
2.  **Project Description:** (Expand on the original description. Add more context about the project's purpose, its intended audience, or the problems it solves. Make it engaging.)
3.  **Features:** (Elaborate on each feature from the "Current 'Features' Section". If it's a list, expand on each item. If it's a paragraph, break it down and detail each aspect. Consider adding sub-features or examples of how features are used. Make this section much richer.)
4.  **Technologies Used:** (For each technology in "Current 'Technologies Used' Section", provide a bit more context. Why might it have been chosen? What is its role in the project? If it's a general list like "React, Node.js", you can add brief, one-sentence descriptions for common technologies if appropriate. Avoid making up new technologies not hinted at.)
5.  **Setup Instructions:** (Take the "Current 'Setup Instructions' Section" and make it more robust. Add pre-requisites if obvious. Clarify steps. Add example commands if generic ones were used. Consider common pitfalls or troubleshooting tips for a typical project of this nature. Ensure it's very easy to follow for someone new.)
6.  **Folder Structure:** (If the "Current 'Folder Structure' Section" is a simple list of files/directories, expand it by explaining the purpose of the key top-level directories and perhaps a few important sub-directories or files. If it says "Not applicable", you can try to generate a generic one based on the project description, or state "A detailed folder structure is best derived from the actual project code." if still too vague.)

Ensure all generated sections are well-formatted (Markdown where appropriate, especially for lists, code blocks).
The output must be a JSON object matching the defined output schema. Be verbose and detailed in your expansions.
`,
});

const generateDetailedReadmeFlow = ai.defineFlow(
  {
    name: 'generateDetailedReadmeFlow',
    inputSchema: GenerateDetailedReadmeInputSchema,
    outputSchema: GenerateDetailedReadmeOutputSchema,
  },
  async (input) => {
    const {output} = await detailedReadmePrompt(input);
    if (!output) {
      throw new Error('AI failed to generate detailed README content.');
    }
    // Ensure the project name from input is preferred unless AI has a strong reason (which is unlikely for this task)
    // Forcing project name to be consistent with input unless explicitly asked to change it.
    // However, the prompt asks to keep it same or refine subtly. So, AI output might be okay.
    // For now, we trust the AI's output for project name as per prompt.
    return output;
  }
);
