
# ReadMeGenius - AI README Generator

ReadMeGenius is a Next.js application that leverages AI (specifically Genkit with Google's Gemini models) to help users generate professional `README.md` files for their software projects. Users can input a GitHub repository URL, paste direct code snippets (from single or multiple files), or provide a textual prompt, and the AI will generate various sections of a README, including project name, description, features, technologies used, setup instructions, and folder structure.

The application also features a theme toggle for light/dark mode preferences and allows users to save, view, download, and delete their generated READMEs using browser localStorage (user-specific). An authentication system (mock, localStorage-based) is included, requiring users to log in to access generation features.

## Tech Stack

*   **Framework**: Next.js (App Router, Server Components, Server Actions)
*   **UI Components**: ShadCN UI
*   **Styling**: Tailwind CSS
*   **AI Integration**: Genkit (with Google Gemini models)
*   **Language**: TypeScript
*   **Icons**: Lucide React
*   **State Management**: React Hooks (useState, useEffect), localStorage for persistence
*   **Forms**: React Hook Form with Zod for validation
*   **Password Hashing**: bcryptjs (for mock authentication)
*   **Linting/Formatting**: Standard Next.js setup (ESLint, Prettier implied)
*   **Deployment**: Configured for Firebase App Hosting (see `apphosting.yaml`)

## Features

*   **AI-Powered README Generation**: (Login Required)
    *   **From GitHub URL**: Summarizes a public GitHub repository and generates README sections.
    *   **From Direct Code Input**: Allows users to upload one or more code files. The AI analyzes the combined content to generate README sections.
    *   **From Textual Prompt**: Users can describe their project, and the AI generates a full README based on the description.
*   **Comprehensive README Sections**:
    *   Project Name (AI Suggested)
    *   Project Description (AI Generated)
    *   Features (AI Inferred/Generated)
    *   Technologies Used (AI Inferred/Generated)
    *   Folder Structure (AI Generated/Generic Example)
    *   Setup Instructions (AI Generated/Generic Example)
*   **User-Specific Saved READMEs**: (Login Required)
    *   Automatically saves successfully generated READMEs to browser `localStorage`, tied to the logged-in user's email.
    *   Users can view, download (as `.md`), and delete their previously saved READMEs.
*   **Theme Toggle**:
    *   Switch between light and dark UI themes.
    *   Theme preference is saved in `localStorage`.
*   **Responsive Design**: Adapts to various screen sizes.
*   **User-Friendly Interface**: Clean and intuitive UI for easy interaction.
*   **Mock Authentication System**:
    *   Signup with full name, email, password, phone.
    *   OTP verification (logged to console).
    *   Login with email and password.
    *   Password hashing using bcryptjs.
    *   Mock "Continue with Google" option.
    *   User session persistence via `localStorage`.
    *   Protected routes/features (README generation requires login).
    *   Dashboard page for logged-in users.

## Specialized Sections

### 1. Main README Generator (Homepage: `/`)

This is the primary interface for generating README files. It offers three input methods (login required):
*   **GitHub URL**: Provide a link to a public GitHub repository.
*   **Direct Code**: Upload one or more code files directly. Their combined content will be analyzed by the AI.
*   **From Prompt**: Describe your project in text, and the AI will craft a README.

Generated READMEs are automatically saved to the logged-in user's `localStorage` and can be managed in the "Saved READMEs" panel that appears on this page.

### 2. README from Past Link/Code (`/past`)

This section provides another instance of the main `ReadmeGenerator` component (login required). It's essentially an alternative access point to the same core generation functionalities available on the homepage, focused on using a GitHub URL or direct code upload (single or multiple files) to generate a README. Saved READMEs here are also managed via the same user-specific `localStorage` as the homepage.

### 3. Past Files Inventory & Gen (`/past-files`)

This dedicated section (login required) allows users to:
1.  **Upload Multiple Files**: Users can select and upload multiple files from their local system.
2.  **View Uploaded Files**: A list of uploaded files (name and size) is displayed. Users can remove files from this list.
3.  **Generate Individual READMEs**: Clicking "Generate READMEs from Files" will trigger the AI to process *each uploaded file individually*. For every file, the AI will attempt to generate a full set of README sections (Project Name, Description, Features, etc.).
4.  **Display Generated READMEs**: Each generated README is displayed separately on the page, associated with its original filename.
5.  **Download Individual README.txt**: For each successfully generated README, a "Download README.txt" button allows users to download its content as a plain text file.

This section is useful when users want to generate distinct READMEs for several separate code files or modules from their local system.

## Getting Started

To run this project locally:

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd <project-name>
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    # or
    # yarn install
    ```

3.  **Set up Environment Variables**:
    *   Create a `.env` file in the root of the project.
    *   You will need to add your Google AI API Key for Genkit to work:
        ```env
        GOOGLE_API_KEY=YOUR_GOOGLE_AI_API_KEY
        ```
    *   Obtain an API key from [Google AI Studio](https://aistudio.google.com/app/apikey).

4.  **Run the development server for Next.js**:
    ```bash
    npm run dev
    # or
    # yarn dev
    ```
    The application will typically be available at `http://localhost:9002`.

5.  **Run the Genkit development server** (in a separate terminal):
    This allows you to inspect and test your Genkit flows.
    ```bash
    npm run genkit:dev
    # or for watching changes:
    # npm run genkit:watch
    ```
    The Genkit developer UI will typically be available at `http://localhost:4000`.

## Project Structure (Key Directories)

*   `src/app/`: Contains the Next.js pages and layouts (App Router).
    *   `src/app/page.tsx`: Homepage.
    *   `src/app/past/page.tsx`: "README from Past Link/Code" section.
    *   `src/app/past-files/page.tsx`: "Past Files Inventory & Gen" section.
    *   `src/app/auth/`: Authentication related pages (login, signup, otp).
    *   `src/app/dashboard/page.tsx`: User dashboard.
*   `src/components/`: Contains React components.
    *   `src/components/ui/`: ShadCN UI components.
    *   `src/components/readme-generator.tsx`: Core component for README generation UI and logic.
    *   `src/components/readme-display.tsx`: Component to display generated README data.
    *   `src/components/theme-toggle.tsx`: Dark/light mode toggle.
    *   `src/components/auth/`: Authentication form components.
*   `src/ai/`: Contains Genkit AI integration files.
    *   `src/ai/flows/`: Genkit flows for different AI tasks (summarization, section generation).
    *   `src/ai/genkit.ts`: Genkit initialization and configuration.
*   `src/lib/`: Contains utility functions and server actions.
    *   `src/lib/actions.ts`: Server actions that orchestrate AI flow calls.
    *   `src/lib/auth/`: Authentication helper functions (storage, password, otp).
    *   `src/lib/schemas/`: Zod validation schemas.
*   `public/`: Static assets.

## Customization

*   **Styling**: Modify Tailwind CSS classes and `src/app/globals.css` for theme adjustments.
*   **AI Prompts**: Adjust the prompts within the files in `src/ai/flows/` to change the AI's behavior and output style.
*   **ShadCN UI**: Add or customize components from `shadcn/ui` as needed.

Enjoy using ReadMeGenius!
