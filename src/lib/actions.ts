
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

    // 1. Summarize Repo (to get description for project name suggestion and README sections)
    const summaryOutput = await summarizeRepo({ repoUrl });
    if (!summaryOutput || !summaryOutput.summary) {
      return { error: "Failed to summarize repository." };
    }
    const repoDescription = summaryOutput.summary;

    // 2. Suggest Project Name based on the description
    const projectNameOutput = await suggestProjectName({
      repoDescription,
    });
    if (!projectNameOutput || !projectNameOutput.projectName) {
      return { error: "Failed to suggest a project name." };
    }
    const projectName = projectNameOutput.projectName;

    // 3. Generate README Sections - Create a *truly generic* mockedFileContents
    // This will be a language-agnostic representation.
    const mockedFileContents = `
// Mocked generic representative file structure for: ${repoUrl}
// Project: ${projectName}
// Description (first 200 chars): ${repoDescription.substring(0, 200)}...
//
// This is a simplified, language-agnostic structural representation.
// The AI should infer technologies primarily from the Project Description.
//
// project-root/
//   src/
//     main_module/  // e.g., components, services, controllers
//       core_logic.file_extension // e.g., .js, .ts, .py, .java, .cs
//       utils.file_extension
//     another_module/
//   tests/
//     unit_tests/
//     integration_tests/
//   docs/
//   scripts/
//   public/ or static/ or assets/
//     images/
//     styles/
//   README.md
//   package.json // or requirements.txt, pom.xml, .csproj, Gemfile etc.
//   main_executable_or_script // e.g., app.js, main.py, Program.cs, server.rb
//   LICENSE
//   .gitignore
//   config_file.yml // or .xml, .json, .env
    `;

    const readmeSectionsOutput = await generateReadmeSections({
      repoUrl,
      fileContents: mockedFileContents,
      projectName,
      projectDescription: repoDescription,
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
      projectDescription: repoDescription,
      features: readmeSectionsOutput.features,
      technologiesUsed: readmeSectionsOutput.technologiesUsed,
      setupInstructions: readmeSectionsOutput.setupInstructions,
    };
  } catch (e: any) {
    console.error("Error processing GitHub repo:", e);
    return { error: e.message || "An unexpected error occurred during README generation." };
  }
}

