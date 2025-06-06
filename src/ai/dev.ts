
import { config } from 'dotenv';
config();

import '@/ai/flows/generate-readme-sections.ts';
import '@/ai/flows/summarize-repo.ts';
import '@/ai/flows/suggest-project-name.ts';
import '@/ai/flows/summarize-code-content.ts';
import '@/ai/flows/generate-readme-from-prompt.ts';
import '@/ai/flows/generate-detailed-readme-flow.ts';
import '@/ai/flows/explain-code-flow.ts'; // Added new flow
import '@/ai/flows/generate-custom-section-flow.ts';
