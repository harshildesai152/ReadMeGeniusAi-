// src/lib/actions.ts
"use server";

import { generateReadmeSections } from "@/ai/flows/generate-readme-sections";
import { summarizeRepo } from "@/ai/flows/summarize-repo";
import { suggestProjectName } from "@/ai/flows/suggest-project-name";

export type FullReadmeData = {
  projectName: string;
  projectDescription: string;
  features: string;
  technologiesUsed: string;
  setupInstructions: string;
};

export async function processGitHubRepo(
  repoUrl: string
): Promise<FullReadmeData | { error: string }> {
  try {
    // Validate repoUrl (basic check)
    if (!repoUrl || !repoUrl.startsWith("https://github.com/")) {
      return { error: "Invalid GitHub repository URL." };
    }

    // 1. Summarize Repo (to get description for project name suggestion)
    const summaryOutput = await summarizeRepo({ repoUrl });
    if (!summaryOutput || !summaryOutput.summary) {
      return { error: "Failed to summarize repository." };
    }
    const repoDescription = summaryOutput.summary;

    // 2. Suggest Project Name
    // Mocking languages as this is not directly provided by current AI flows from just a URL
    const mockedRepoLanguages = "TypeScript, JavaScript, Python"; // Example
    const projectNameOutput = await suggestProjectName({
      repoDescription,
      repoLanguages: mockedRepoLanguages,
    });
    if (!projectNameOutput || !projectNameOutput.projectName) {
      return { error: "Failed to suggest a project name." };
    }
    const projectName = projectNameOutput.projectName;

    // 3. Generate README Sections
    // Mocking fileContents as fetching all files is a complex task beyond current AI flows
    const mockedFileContents = `
      // Mocked file contents for ${repoUrl}
      // This is a placeholder. In a real scenario, actual file contents would be fetched.
      function helloWorld() { console.log("Hello from ${projectName}"); }
    `;
    const readmeSectionsOutput = await generateReadmeSections({
      repoUrl,
      fileContents: mockedFileContents,
      projectName,
    });

    if (
      !readmeSectionsOutput ||
      !readmeSectionsOutput.features ||
      !readmeSectionsOutput.technologiesUsed ||
      !readmeSectionsOutput.setupInstructions
    ) {
      return { error: "Failed to generate README sections." };
    }

    return {
      projectName,
      projectDescription: repoDescription, // Using the summary as the description
      features: readmeSectionsOutput.features,
      technologiesUsed: readmeSectionsOutput.technologiesUsed,
      setupInstructions: readmeSectionsOutput.setupInstructions,
    };
  } catch (e: any) {
    console.error("Error processing GitHub repo:", e);
    return { error: e.message || "An unexpected error occurred during README generation." };
  }
}
