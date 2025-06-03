
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
    const lowerRepoDescription = repoDescription.toLowerCase();

    // 2. Suggest Project Name based on the description
    const projectNameOutput = await suggestProjectName({
      repoDescription,
    });
    if (!projectNameOutput || !projectNameOutput.projectName) {
      return { error: "Failed to suggest a project name." };
    }
    const projectName = projectNameOutput.projectName;
    const lowerProjectName = projectName.toLowerCase();

    // 3. Generate README Sections - Create more contextual mockedFileContents
    let mockedFileContents = `
// Mocked generic representative file structure for: ${repoUrl}
// Project: ${projectName}
// Description: ${repoDescription.substring(0, 200)}...
//
// This is a simplified representation. The AI will infer technologies
// based on this, the project description, and common patterns.
//
// project-root/
//   src/
//     main_module/
//       core_logic.file_extension
//       utils.file_extension
//   tests/
//   README.md
//   config.file
//   main_executable_or_script
    `; // Default generic mock

    // Attempt to create more language-specific mocks based on description
    if (lowerRepoDescription.includes("python") || lowerProjectName.includes("python")) {
      mockedFileContents = `
# Mocked representative file contents for a Python project: ${repoUrl}
# Project: ${projectName}
# Description: ${repoDescription.substring(0, 150)}...

# def main():
#   print("Python project: ${projectName} initialized.")
#   # Example function call
#   # result = some_python_function(arg1, arg2)
#   # print(f"Result: {result}")

# if __name__ == "__main__":
#   main()
      `;
    } else if (lowerRepoDescription.includes("java") && !lowerRepoDescription.includes("javascript")) {
       mockedFileContents = `
// Mocked representative file contents for a Java project: ${repoUrl}
// Project: ${projectName}
// Description: ${repoDescription.substring(0, 150)}...

// public class MainApplication {
//   public static void main(String[] args) {
//     System.out.println("Java project: ${projectName} initialized.");
//     // Example method call
//     // String data = DataService.fetchData();
//     // System.out.println("Data: " + data);
//   }
// }
      `;
    } else if (lowerRepoDescription.includes("c#") || lowerRepoDescription.includes("csharp") || lowerRepoDescription.includes(".net")) {
       mockedFileContents = `
// Mocked representative file contents for a C# .NET project: ${repoUrl}
// Project: ${projectName}
// Description: ${repoDescription.substring(0, 150)}...

// using System;
//
// namespace ${projectName.replace(/\s+/g, '')} {
//   class Program {
//     static void Main(string[] args) {
//       Console.WriteLine("C# project: ${projectName} initialized.");
//       // Example usage
//       // var service = new MyService();
//       // service.DoWork();
//     }
//   }
// }
      `;
    } else if (
      lowerRepoDescription.includes("typescript") ||
      lowerRepoDescription.includes("react") ||
      lowerRepoDescription.includes("angular") ||
      lowerRepoDescription.includes("vue") ||
      lowerRepoDescription.includes("frontend") ||
      lowerRepoDescription.includes("node.js") || // Node.js often uses TS/JS
      lowerRepoDescription.includes("express.js") ||
      lowerProjectName.includes('portfolio') ||
      lowerRepoDescription.includes('personal website') ||
      lowerRepoDescription.includes('static site') ||
      lowerProjectName.includes('e-comm') || // E-commerce often uses JS/TS stacks
      lowerProjectName.includes('store') ||
      lowerRepoDescription.includes('e-commerce') ||
      lowerRepoDescription.includes('mern stack')
    ) {
      // More specific for TS/JS heavy projects (frontend, Node.js backends)
      mockedFileContents = `
// Mocked representative file contents for a TypeScript/JavaScript project: ${repoUrl}
// Project: ${projectName}
// Description: ${repoDescription.substring(0, 150)}...

// Example: A TypeScript or JavaScript module structure
// import { someFunction } from './utils'; // or const someFunction = require('./utils');
//
// class MainApplication {
//   constructor(private config: any) {
//     console.log("Initializing ${projectName} with config:", config);
//   }
//
//   public run(): void {
//     console.log("${projectName} is running.");
//     // const result = someFunction();
//     // console.log("Result from util:", result);
//   }
// }
//
// // const appConfig = { setting: 'value' };
// // const app = new MainApplication(appConfig);
// // app.run();
// //
// // export default MainApplication; // or module.exports = MainApplication;
console.log("Project structure likely involving TypeScript/JavaScript (e.g., React, Node.js, Vue, Angular, general web app).");
      `;
    }
    // The AI prompt for generateReadmeSections is already quite strict about
    // basing technologies on the description and *explicitly visible* technologies
    // in the sample code. The key is that this sample code is now more targeted.

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
