
// src/lib/actions.ts
"use server";

import { generateReadmeSections } from "@/ai/flows/generate-readme-sections";
import { summarizeRepo } from "@/ai/flows/summarize-repo";
import { suggestProjectName } from "@/ai/flows/suggest-project-name";
import { summarizeCodeContent } from "@/ai/flows/summarize-code-content"; // New import

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
};

export async function processGitHubRepo(
  input: ProcessInput
): Promise<FullReadmeData | { error: string }> {
  try {
    let repoDescription: string;
    let fileContentsForSections: string;
    let effectiveRepoUrl: string | undefined = input.repoUrl;

    if (input.repoUrl) {
      if (!input.repoUrl.startsWith("https://github.com/")) {
        return { error: "Invalid GitHub repository URL." };
      }
      const summaryOutput = await summarizeRepo({ repoUrl: input.repoUrl });
      if (!summaryOutput || !summaryOutput.summary) {
        return { error: "Failed to summarize repository." };
      }
      repoDescription = summaryOutput.summary;
      // Generate mockedFileContents for repoUrl input
      fileContentsForSections = `
// Mocked generic representative file structure for: ${input.repoUrl}
// Description (first 200 chars): ${repoDescription.substring(0, 200)}...
//
// This is a simplified, language-agnostic structural representation.
// The AI should infer technologies primarily from the Project Description.
//
// project-root/
//   src/
//     main_module/
//       core_logic.file_extension
//       utils.file_extension
//     another_module/
//   tests/
//   docs/
//   scripts/
//   public/ or static/
//   README.md
//   package.json or similar
//   LICENSE
//   .gitignore
      `;
    } else if (input.codeContent) {
      const summaryOutput = await summarizeCodeContent({ codeContent: input.codeContent });
      if (!summaryOutput || !summaryOutput.summary) {
        return { error: "Failed to summarize code content." };
      }
      repoDescription = summaryOutput.summary;
      fileContentsForSections = input.codeContent; // Use actual code for sections
      effectiveRepoUrl = undefined; // No real URL for direct code input
    } else {
      return { error: "Either a repository URL or code content must be provided." };
    }

    const projectNameOutput = await suggestProjectName({
      repoDescription,
    });
    if (!projectNameOutput || !projectNameOutput.projectName) {
      return { error: "Failed to suggest a project name." };
    }
    const projectName = projectNameOutput.projectName;

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
      readmeSectionsOutput.folderStructure === undefined // Check for undefined specifically
    ) {
      return { error: "Failed to generate README sections." };
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
    if (e.message && e.message.includes("503 Service Unavailable") || e.message && e.message.includes("model is overloaded")) {
      return { error: "The AI model is currently overloaded. Please try again in a few moments." };
    }
    return { error: e.message || "An unexpected error occurred during README generation." };
  }
}
