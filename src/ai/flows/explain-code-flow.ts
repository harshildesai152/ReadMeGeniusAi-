
'use server';
/**
 * @fileOverview An AI flow to explain code snippets.
 *
 * - explainCodeAi - A function that explains the provided code.
 * - ExplainCodeInput - The input type for the explainCodeAi function.
 * - ExplainCodeOutput - The return type for the explainCodeAi function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainCodeInputSchema = z.object({
  code: z.string().describe('The code snippet to be explained.'),
  level: z.enum(['beginner', 'technical']).describe("The desired explanation level: 'beginner' or 'technical'."),
});
export type ExplainCodeInput = z.infer<typeof ExplainCodeInputSchema>;

const ExplainCodeOutputSchema = z.object({
  explanation: z.string().describe('The explanation of the code snippet.'),
});
export type ExplainCodeOutput = z.infer<typeof ExplainCodeOutputSchema>;

export async function explainCodeAi(input: ExplainCodeInput): Promise<ExplainCodeOutput> {
  return explainCodeFlow(input);
}

const explainCodePrompt = ai.definePrompt({
  name: 'explainCodePrompt',
  input: {schema: ExplainCodeInputSchema},
  output: {schema: ExplainCodeOutputSchema},
  prompt: `You are an expert code explainer. Your task is to explain the provided code snippet.
The user wants an explanation tailored for a '{{{level}}}' audience.

If '{{{level}}}' is 'beginner':
- Use simple language. Avoid jargon unless absolutely necessary, and if so, explain it clearly.
- Focus on the overall purpose of the code and what it achieves from a high level.
- Break down complex parts into smaller, easily understandable steps.
- Provide analogies or simple examples if they help clarify a concept.
- Do not assume prior programming knowledge for very complex topics; simplify concepts.

If '{{{level}}}' is 'technical':
- Provide a more in-depth and precise explanation.
- Discuss data structures, algorithms, design patterns, or architectural considerations if relevant.
- Explain specific syntax choices, language features, or optimizations used.
- Mention potential trade-offs, performance implications, or alternative approaches if insightful.
- Assume the audience has a reasonable understanding of programming concepts and the language used.

Code to explain:
\`\`\`
{{{code}}}
\`\`\`

Provide your explanation clearly and concisely, formatted for readability.
If the code is too short or trivial (e.g., a single variable declaration), provide a brief explanation of its syntax or purpose.
If the code is not understandable or appears to be non-code text, state that you cannot explain it as code.
`,
});

const explainCodeFlow = ai.defineFlow(
  {
    name: 'explainCodeFlow',
    inputSchema: ExplainCodeInputSchema,
    outputSchema: ExplainCodeOutputSchema,
  },
  async (input) => {
    const {output} = await explainCodePrompt(input);
    if (!output) {
      throw new Error('AI failed to generate an explanation for the code.');
    }
    return output;
  }
);
