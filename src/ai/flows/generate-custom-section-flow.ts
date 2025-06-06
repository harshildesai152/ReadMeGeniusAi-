
'use server';
/**
 * @fileOverview Generates a title and description for a custom section based on a user prompt.
 *
 * - generateCustomSectionContent - AI flow to generate section content.
 * - GenerateCustomSectionInput - Input type for the flow.
 * - GenerateCustomSectionOutput - Output type for the flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCustomSectionInputSchema = z.object({
  userPrompt: z.string().describe('A prompt or idea from the user for a new section.'),
});
export type GenerateCustomSectionInput = z.infer<typeof GenerateCustomSectionInputSchema>;

const GenerateCustomSectionOutputSchema = z.object({
  sectionTitle: z.string().describe('A concise and relevant title for the new section based on the prompt.'),
  sectionDescription: z.string().describe('A descriptive paragraph or content for the new section based on the prompt. This should be formatted nicely, potentially using Markdown if appropriate (e.g., lists for multiple points).'),
});
export type GenerateCustomSectionOutput = z.infer<typeof GenerateCustomSectionOutputSchema>;

export async function generateCustomSectionContent(input: GenerateCustomSectionInput): Promise<GenerateCustomSectionOutput> {
  return generateCustomSectionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCustomSectionPrompt',
  input: {schema: GenerateCustomSectionInputSchema},
  output: {schema: GenerateCustomSectionOutputSchema},
  prompt: `You are an AI assistant helping a user add a new section to their README file.
The user has provided a prompt or an idea for this new section.

User Prompt:
{{{userPrompt}}}

Based on this prompt, please generate:
1.  **sectionTitle**: A concise and relevant title for this new section. Make the title a Level 2 Markdown heading (e.g., ## Title).
2.  **sectionDescription**: A well-written paragraph or content for this section. If the prompt suggests multiple points or steps, consider using Markdown list format in the description. The description should clearly explain or elaborate on the user's prompt.

Ensure the title is fitting and the description is informative.
Example:
If user prompt is "Explain how to contribute to the project",
sectionTitle could be: "## Contributing"
sectionDescription could be: "We welcome contributions! Please see our CONTRIBUTING.md file for guidelines on how to submit pull requests, report issues, and suggest features. Ensure your code adheres to our linting standards and all tests pass before submitting."

If user prompt is "New feature: user authentication",
sectionTitle could be: "## User Authentication"
sectionDescription could be: "This project now includes a robust user authentication system. Users can sign up, log in, and manage their profiles securely. Authentication is handled via JWT tokens."
`,
});

const generateCustomSectionFlow = ai.defineFlow(
  {
    name: 'generateCustomSectionFlow',
    inputSchema: GenerateCustomSectionInputSchema,
    outputSchema: GenerateCustomSectionOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('AI failed to generate custom section content.');
    }
    // Ensure title is H2 if not already
    let finalTitle = output.sectionTitle.trim();
    if (!finalTitle.startsWith("## ")) {
        if (finalTitle.startsWith("#")) { // Remove existing hashes
            finalTitle = finalTitle.replace(/^#+\s*/, '');
        }
        finalTitle = `## ${finalTitle}`;
    }

    return {
        ...output,
        sectionTitle: finalTitle
    };
  }
);

