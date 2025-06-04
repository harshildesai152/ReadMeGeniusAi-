
// src/lib/actions.ts
"use server";

import { generateReadmeSections } from "@/ai/flows/generate-readme-sections";
import { summarizeRepo } from "@/ai/flows/summarize-repo";
import { suggestProjectName } from "@/ai/flows/suggest-project-name";
import { summarizeCodeContent } from "@/ai/flows/summarize-code-content";
import { generateReadmeFromPrompt } from "@/ai/flows/generate-readme-from-prompt"; // New import

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
  userPrompt?: string; // New field for prompt-based generation
};

export async function processGitHubRepo( // Consider renaming this function if its scope expands
  input: ProcessInput
): Promise<FullReadmeData | { error: string }> {
  try {
    // Handle prompt-based generation first
    if (input.userPrompt) {
      if (!input.userPrompt.trim()) {
        return { error: "User prompt cannot be empty." };
      }
      const readmeDataFromPrompt = await generateReadmeFromPrompt({ userPrompt: input.userPrompt });
      if (!readmeDataFromPrompt) {
        return { error: "Failed to generate README from prompt." };
      }
      return readmeDataFromPrompt; // This directly returns FullReadmeData
    }

    // Existing logic for URL or code content
    let repoDescription: string;
    let fileContentsForSections: string;
    let effectiveRepoUrl: string | undefined = input.repoUrl;
    let sourceProjectName: string | undefined = undefined;


    if (input.repoUrl) {
      if (!input.repoUrl.startsWith("https://github.com/")) {
        return { error: "Invalid GitHub repository URL." };
      }
      // Extract a potential project name from the URL as a fallback
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
//
// project-root/
//   src/
//     main_module/
//       core_logic.file_extension
//       utils.file_extension
//     api/
//       endpoints.file_extension
//   tests/
//     unit/
//     integration/
//   docs/
//     api_reference.md
//     user_guide.md
//   scripts/
//     deploy.sh
//     build.sh
//   public/ or static/
//     index.html
//     styles.css
//     images/
//   README.md
//   package.json or requirements.txt or pom.xml or Gemfile
//   LICENSE
//   .gitignore
//   .env.example
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
    let projectName = sourceProjectName; // Use name from URL if available
    if (projectNameOutput && projectNameOutput.projectName) {
      projectName = projectNameOutput.projectName;
    }
    if (!projectName) {
         // Fallback if AI suggestion fails and no URL name
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
