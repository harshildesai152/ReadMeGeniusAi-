
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
    // Mocking fileContents - this is crucial for the AI's inference.
    // Make it more contextual based on project type.
    let mockedFileContents = `
      // Mocked generic representative file contents for: ${repoUrl}
      // Project: ${projectName}
      // Description: ${repoDescription.substring(0, 150)}...

      // Main function or class structure
      class MainApplication {
        constructor() {
          console.log("Initializing ${projectName}");
        }
        run() {
          console.log("${projectName} is running.");
        }
      }
      const app = new MainApplication();
      app.run();
    `;

    const lowerProjectName = projectName.toLowerCase();
    const lowerRepoDescription = repoDescription.toLowerCase();

    if (
      lowerProjectName.includes('portfolio') ||
      lowerRepoDescription.includes('personal website') ||
      lowerRepoDescription.includes('frontend application') ||
      lowerRepoDescription.includes('static site')
    ) {
      mockedFileContents = `
        // Mocked representative file contents for a frontend/portfolio project: ${repoUrl}
        // Project: ${projectName}
        // Description: ${repoDescription.substring(0, 150)}...

        // Example: A TypeScript React component structure
        // import type { FC } from 'react';
        //
        // interface ProjectCardProps {
        //   title: string;
        //   description: string;
        //   tech: string[];
        // }
        //
        // const ProjectDisplay: FC<ProjectCardProps> = ({ title, description, tech }) => {
        //   return (
        //     <article className="project-card">
        //       <h2>{title}</h2>
        //       <p>{description}</p>
        //       <div>Technologies: {tech.join(', ')}</div>
        //     </article>
        //   );
        // };
        // export default ProjectDisplay;

        // Basic TypeScript class example
        // class DataFetcher {
        //   private endpoint: string;
        //   constructor(endpointUrl: string) {
        //     this.endpoint = endpointUrl;
        //   }
        //   async fetchData<T>(id: string): Promise<T | null> {
        //     try {
        //       // const response = await fetch(\`\${this.endpoint}/\${id}\`);
        //       // if (!response.ok) throw new Error('Network response was not ok');
        //       // return await response.json() as T;
        //       console.log(\`Fetching data from \${this.endpoint}/\${id}\`);
        //       return null; // Mocked
        //     } catch (error) {
        //       console.error("Failed to fetch data:", error);
        //       return null;
        //     }
        //   }
        // }
        //
        // // Usage:
        // // const api = new DataFetcher("/api/items");
        // // api.fetchData<any>("123").then(data => console.log(data));
        //
        // console.log("Portfolio or frontend project structure with TypeScript.");
      `;
    } else if (
      lowerProjectName.includes('e-comm') ||
      lowerProjectName.includes('store') ||
      lowerRepoDescription.includes('e-commerce') ||
      lowerRepoDescription.includes('mern stack') ||
      lowerRepoDescription.includes('backend api')
    ) {
      mockedFileContents = `
        // Mocked representative file contents for an e-commerce/backend project: ${repoUrl}
        // Project: ${projectName}
        // Description: ${repoDescription.substring(0, 150)}...

        // Example: Node.js Express server with TypeScript
        // import express, { Request, Response, NextFunction } from 'express';
        //
        // const app = express();
        // app.use(express.json());
        //
        // interface Product {
        //   id: string;
        //   name: string;
        //   price: number;
        // }
        //
        // // Mock database
        // const products: Product[] = [];
        //
        // app.get('/api/products', (req: Request, res: Response) => {
        //   res.json(products);
        // });
        //
        // app.post('/api/products', (req: Request, res: Response) => {
        //   const newProduct = req.body as Product;
        //   products.push(newProduct);
        //   res.status(201).json(newProduct);
        // });
        //
        // // const PORT = process.env.PORT || 3001;
        // // app.listen(PORT, () => console.log(\`Server running on port \${PORT}\`));
        // console.log("E-commerce or backend project structure with Node.js/TypeScript.");
      `;
    }

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
