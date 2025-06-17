
// src/lib/actions.ts
"use server";

import { generateReadmeSections } from "@/ai/flows/generate-readme-sections";
import { summarizeRepo } from "@/ai/flows/summarize-repo";
import { suggestProjectName } from "@/ai/flows/suggest-project-name";
import { summarizeCodeContent } from "@/ai/flows/summarize-code-content";
import { generateReadmeFromPrompt } from "@/ai/flows/generate-readme-from-prompt";
import { generateDetailedReadme as generateDetailedReadmeCore } from "@/ai/flows/generate-detailed-readme-flow.ts";
import { explainCodeAi, type ExplainCodeInput, type ExplainCodeOutput } from "@/ai/flows/explain-code-flow";
import {
  generateCustomSectionContent,
  type GenerateCustomSectionInput,
  type GenerateCustomSectionOutput,
} from '@/ai/flows/generate-custom-section-flow';


export type FullReadmeData = {
  projectName: string;
  projectDescription: string;
  features: string;
  technologiesUsed: string;
  setupInstructions: string;
  folderStructure: string;
};

type ProcessInput = {
  repoUrl?: string;
  codeContent?: string;
  userPrompt?: string;
};

export async function processGitHubRepo(
  input: ProcessInput
): Promise<FullReadmeData | { error: string }> {
  try {
    if (input.userPrompt) {
      if (!input.userPrompt.trim()) {
        return { error: "User prompt cannot be empty." };
      }
      const readmeDataFromPrompt = await generateReadmeFromPrompt({ userPrompt: input.userPrompt });
      if (!readmeDataFromPrompt) {
        return { error: "Failed to generate README from prompt." };
      }
      return readmeDataFromPrompt;
    }

    let repoDescription: string;
    let fileContentsForSections: string;
    let effectiveRepoUrl: string | undefined = input.repoUrl;
    let sourceProjectName: string | undefined = undefined;

    if (input.repoUrl) {
      if (!input.repoUrl.startsWith("https://github.com/")) {
        return { error: "Invalid GitHub repository URL." };
      }
      try {
        const pathParts = new URL(input.repoUrl).pathname.split('/');
        if (pathParts.length >= 2 && pathParts[1]) {
          sourceProjectName = pathParts[pathParts.length-1].replace('.git', '');
        }
      } catch (e) { /* ignore error parsing URL for project name */ }

      const summaryOutput = await summarizeRepo({ repoUrl: input.repoUrl });
      if (!summaryOutput || !summaryOutput.summary) {
        return { error: "Failed to summarize repository." };
      }
      repoDescription = summaryOutput.summary;
      fileContentsForSections = `
// Generic representative file structure for: ${input.repoUrl}
// Project Description (first 200 chars): ${repoDescription.substring(0, 200)}...
// This is a simplified, language-agnostic structural representation.
// The AI should infer technologies primarily from the Project Description.
      `;
    } else if (input.codeContent) {
      const summaryOutput = await summarizeCodeContent({ codeContent: input.codeContent });
      if (!summaryOutput || !summaryOutput.summary) {
        return { error: "Failed to summarize code content." };
      }
      repoDescription = summaryOutput.summary;
      fileContentsForSections = input.codeContent;
      effectiveRepoUrl = undefined;
    } else {
      return { error: "Either a repository URL, code content, or a user prompt must be provided." };
    }

    const projectNameOutput = await suggestProjectName({ repoDescription });
    let projectName = sourceProjectName;
    if (projectNameOutput && projectNameOutput.projectName) {
      projectName = projectNameOutput.projectName;
    }
    if (!projectName) {
        projectName = "My Awesome Project";
    }

    const readmeSectionsOutput = await generateReadmeSections({
      repoUrl: effectiveRepoUrl,
      fileContents: fileContentsForSections,
      projectName,
      projectDescription: repoDescription,
    });

    if (
      !readmeSectionsOutput ||
      !readmeSectionsOutput.features ||
      !readmeSectionsOutput.technologiesUsed ||
      !readmeSectionsOutput.setupInstructions ||
      readmeSectionsOutput.folderStructure === undefined
    ) {
      return { error: "Failed to generate README sections from URL/code." };
    }

    return {
      projectName,
      projectDescription: repoDescription,
      features: readmeSectionsOutput.features,
      technologiesUsed: readmeSectionsOutput.technologiesUsed,
      setupInstructions: readmeSectionsOutput.setupInstructions,
      folderStructure: readmeSectionsOutput.folderStructure,
    };
  } catch (e: any) {
    console.error("Error processing input:", e);
    if (e.message && (e.message.includes("503 Service Unavailable") || e.message.includes("model is overloaded") || e.message.includes("upstream connect error"))) {
      return { error: "The AI model is currently overloaded or unavailable. Please try again in a few moments." };
    }
    return { error: e.message || "An unexpected error occurred during README generation." };
  }
}

export async function generateDetailedReadme(
  currentData: FullReadmeData
): Promise<FullReadmeData | { error: string }> {
  try {
    if (!currentData) {
      return { error: "Current README data must be provided to generate details." };
    }

    const detailedOutput = await generateDetailedReadmeCore({
      projectName: currentData.projectName,
      projectDescription: currentData.projectDescription,
      currentFeatures: currentData.features,
      currentTechnologiesUsed: currentData.technologiesUsed,
      currentSetupInstructions: currentData.setupInstructions,
      currentFolderStructure: currentData.folderStructure,
    });

    if (!detailedOutput) {
      return { error: "Failed to generate detailed README content." };
    }

    return detailedOutput;

  } catch (e: any) {
    console.error("Error generating detailed README:", e);
     if (e.message && (e.message.includes("503 Service Unavailable") || e.message.includes("model is overloaded") || e.message.includes("upstream connect error"))) {
      return { error: "The AI model is currently overloaded or unavailable for generating details. Please try again in a few moments." };
    }
    return { error: e.message || "An unexpected error occurred while generating detailed README." };
  }
}

export async function explainCodeAction(
  code: string,
  level: 'beginner' | 'technical'
): Promise<{ explanation?: string; error?: string }> {
  try {
    if (!code.trim()) {
      return { error: "Code snippet cannot be empty." };
    }
    const input: ExplainCodeInput = { code, level };
    const result: ExplainCodeOutput = await explainCodeAi(input);
    if (!result || !result.explanation) {
      return { error: "Failed to get explanation from AI." };
    }
    return { explanation: result.explanation };
  } catch (e: any) {
    console.error("Error in explainCodeAction:", e);
    if (e.message && (e.message.includes("503 Service Unavailable") || e.message.includes("model is overloaded") || e.message.includes("upstream connect error"))) {
      return { error: "The AI model for code explanation is currently overloaded or unavailable. Please try again in a few moments." };
    }
    return { error: e.message || "An unexpected error occurred while explaining code." };
  }
}

export async function generateAiSectionAction(
  userPrompt: string
): Promise<GenerateCustomSectionOutput | { error: string }> {
  try {
    if (!userPrompt.trim()) {
      return { error: "Prompt for the new section cannot be empty." };
    }
    const input: GenerateCustomSectionInput = { userPrompt };
    const result = await generateCustomSectionContent(input);

    if (!result || !result.sectionTitle || !result.sectionDescription === undefined) {
      return { error: "AI failed to generate content for the section." };
    }
    return result;
  } catch (e: any) {
    console.error("Error in generateAiSectionAction:", e);
    if (e.message && (e.message.includes("503 Service Unavailable") || e.message.includes("model is overloaded") || e.message.includes("upstream connect error"))) {
      return { error: "The AI model for section generation is currently overloaded or unavailable. Please try again." };
    }
    return { error: e.message || "An unexpected error occurred while generating the AI section." };
  }
}
