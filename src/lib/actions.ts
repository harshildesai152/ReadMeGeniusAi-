
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

    // 3. Generate README Sections
    // Mocking fileContents as fetching all files is a complex task beyond current AI flows in this prototype.
    // This content should be representative enough for the AI to infer basic project structure/type.
    const mockedFileContents = `
      // Mocked representative file contents for: ${repoUrl}
      // Project: ${projectName}
      // Description: ${repoDescription.substring(0, 100)}...

      // Example: A simple function or component structure
      // If this were a React project, it might look like:
      // import React from 'react';
      // const MainComponent = () => (
      //   <div>
      //     <h1>Welcome to ${projectName}</h1>
      //     <p>This project is about ${repoDescription.substring(0,50)}...</p>
      //   </div>
      // );
      // export default MainComponent;

      // If this were a Node.js backend, it might look like:
      // const express = require('express');
      // const app = express();
      // app.get('/', (req, res) => {
      //   res.send('Hello from ${projectName}');
      // });
      // app.listen(3000, () => console.log('Server started for ${projectName}'));

      // Generic placeholder:
      function projectMainFunction() {
        console.log("Core logic for ${projectName} would be here.");
      }
      projectMainFunction();
    `;

    const readmeSectionsOutput = await generateReadmeSections({
      repoUrl,
      fileContents: mockedFileContents,
      projectName,
      projectDescription: repoDescription, // Pass description to help with technology inference and features
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
