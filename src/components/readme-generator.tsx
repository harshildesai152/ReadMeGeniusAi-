
// src/components/readme-generator.tsx
"use client";

import { useState, useEffect, FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, AlertTriangle, Github, FileCode, Eye, Trash2, Download, MessagesSquare } from "lucide-react";
import { processGitHubRepo, type FullReadmeData } from "@/lib/actions";
import { ReadmeDisplay } from "./readme-display";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

type InputType = "url" | "code" | "prompt";

interface SavedReadmeItem extends FullReadmeData {
  id: string;
  savedDate: string;
  inputTypeUsed?: InputType; // Optional: to remember how it was generated
  originalInput?: string; // Optional: to store the URL, code snippet, or prompt
}

export function ReadmeGenerator() {
  const [inputType, setInputType] = useState<InputType>("url");
  const [repoUrl, setRepoUrl] = useState<string>("");
  const [codeContent, setCodeContent] = useState<string>("");
  const [userPrompt, setUserPrompt] = useState<string>("");
  const [generatedReadmeData, setGeneratedReadmeData] = useState<FullReadmeData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [savedReadmes, setSavedReadmes] = useState<SavedReadmeItem[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const storedReadmes = localStorage.getItem("savedReadmes");
      if (storedReadmes) {
        try {
          setSavedReadmes(JSON.parse(storedReadmes));
        } catch (e) {
          console.error("Failed to parse saved READMEs from localStorage", e);
          localStorage.removeItem("savedReadmes");
        }
      }
    }
  }, []);

  useEffect(() => {
    if (mounted && savedReadmes.length > 0) {
      localStorage.setItem("savedReadmes", JSON.stringify(savedReadmes));
    } else if (mounted && savedReadmes.length === 0) {
      localStorage.removeItem("savedReadmes");
    }
  }, [savedReadmes, mounted]);

  const handleSaveReadme = (readmeToSave: FullReadmeData, inputTypeUsed: InputType, originalInput: string) => {
    if (!mounted) return;
    const newReadme: SavedReadmeItem = {
      ...readmeToSave,
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      savedDate: new Date().toISOString(),
      inputTypeUsed,
      originalInput,
    };
    setSavedReadmes((prev) => [newReadme, ...prev.slice(0, 19)]); // Keep latest 20
    toast({
      title: "README Automatically Saved!",
      description: `${newReadme.projectName} has been added to your saved list.`,
    });
  };

  const handleDeleteReadme = (id: string) => {
    if (!mounted) return;
    setSavedReadmes((prev) => prev.filter((item) => item.id !== id));
    toast({
      title: "README Deleted",
      description: "The saved README has been removed.",
      variant: "destructive",
    });
  };

  const handleLoadReadme = (readmeItem: SavedReadmeItem) => {
    if (!mounted) return;
    setGeneratedReadmeData(readmeItem);
    setError(null);
    toast({
      title: "README Loaded",
      description: `${readmeItem.projectName} is now displayed.`,
    });
    const displayElement = document.getElementById("readme-display-card");
    if (displayElement) {
      displayElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleDownloadReadme = (readmeItem: SavedReadmeItem) => {
    if (!mounted) return;
    const readmeText = `
# ${readmeItem.projectName}

## Project Description
${readmeItem.projectDescription}

## Features
${readmeItem.features}

## Technologies Used
${readmeItem.technologiesUsed}

## Folder Structure
${readmeItem.folderStructure}

## Setup Instructions
${readmeItem.setupInstructions}
    `.trim();

    const blob = new Blob([readmeText], { type: 'text/markdown;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    const sanitizedProjectName = readmeItem.projectName.replace(/[^a-z0-9_]/gi, '_').toLowerCase();
    link.download = `${sanitizedProjectName || 'readme'}.md`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);

    toast({
      title: "README Downloading...",
      description: `${link.download} will be downloaded.`,
    });
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!mounted) return;

    setError(null);
    setIsLoading(true);

    let result;
    let originalInputValue = "";

    if (inputType === "url") {
      if (!repoUrl) {
        setError("Please enter a GitHub repository URL.");
        setIsLoading(false);
        return;
      }
      try {
        const url = new URL(repoUrl);
        if (url.hostname !== 'github.com') {
          setError("Please enter a valid GitHub repository URL.");
          setIsLoading(false);
          return;
        }
      } catch (_) {
        setError("Invalid URL format.");
        setIsLoading(false);
        return;
      }
      originalInputValue = repoUrl;
      result = await processGitHubRepo({ repoUrl });
    } else if (inputType === "code") {
      if (!codeContent.trim()) {
        setError("Please enter some code to analyze.");
        setIsLoading(false);
        return;
      }
      originalInputValue = codeContent;
      result = await processGitHubRepo({ codeContent });
    } else if (inputType === "prompt") {
      if (!userPrompt.trim()) {
        setError("Please enter a prompt to generate the README.");
        setIsLoading(false);
        return;
      }
      originalInputValue = userPrompt;
      result = await processGitHubRepo({ userPrompt });
    }


    if (result && "error" in result) {
      setError(result.error);
      setGeneratedReadmeData(null);
    } else if (result) {
      setGeneratedReadmeData(result);
      handleSaveReadme(result, inputType, originalInputValue);
    } else {
      setError("An unexpected error occurred.");
      setGeneratedReadmeData(null);
    }
    setIsLoading(false);
  };

  if (!mounted) {
    return (
      <div className="w-full max-w-3xl space-y-8">
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center font-headline">Generate Your README</CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              Loading README generator...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse space-y-4">
              <div className="h-10 bg-muted rounded-md"></div>
              <div className="h-10 bg-muted rounded-md w-1/3 mx-auto"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl space-y-8">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center font-headline">Generate Your README</CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Choose your input method. Generated READMEs are automatically saved.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <RadioGroup
              defaultValue="url"
              onValueChange={(value: string) => {
                setInputType(value as InputType);
                setError(null); // Clear error when changing input type
                setGeneratedReadmeData(null); // Clear previous results
              }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 justify-center"
              aria-label="Input method"
            >
              <Label htmlFor="url-input" className={`flex items-center space-x-2 p-3 border rounded-md cursor-pointer hover:bg-accent hover:text-accent-foreground ${inputType === 'url' ? 'bg-accent text-accent-foreground ring-2 ring-ring' : 'bg-background'}`}>
                <RadioGroupItem value="url" id="url-input" className="sr-only" />
                <Github className="h-5 w-5" />
                <span>GitHub URL</span>
              </Label>
              <Label htmlFor="code-input" className={`flex items-center space-x-2 p-3 border rounded-md cursor-pointer hover:bg-accent hover:text-accent-foreground ${inputType === 'code' ? 'bg-accent text-accent-foreground ring-2 ring-ring' : 'bg-background'}`}>
                <RadioGroupItem value="code" id="code-input" className="sr-only" />
                <FileCode className="h-5 w-5" />
                <span>Direct Code</span>
              </Label>
              <Label htmlFor="prompt-input" className={`flex items-center space-x-2 p-3 border rounded-md cursor-pointer hover:bg-accent hover:text-accent-foreground ${inputType === 'prompt' ? 'bg-accent text-accent-foreground ring-2 ring-ring' : 'bg-background'}`}>
                <RadioGroupItem value="prompt" id="prompt-input" className="sr-only" />
                <MessagesSquare className="h-5 w-5" />
                <span>From Prompt</span>
              </Label>
            </RadioGroup>

            {inputType === "url" && (
              <div className="relative">
                <Github className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="url"
                  placeholder="e.g., https://github.com/username/repository"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  className="pl-10 text-base"
                  aria-label="GitHub Repository URL"
                  disabled={isLoading}
                />
              </div>
            )}
            {inputType === "code" && (
              <div className="relative">
                <FileCode className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Textarea
                  placeholder="Paste your code snippet here (e.g., a key component, file structure example, or main script)..."
                  value={codeContent}
                  onChange={(e) => setCodeContent(e.target.value)}
                  className="pl-10 text-base min-h-[150px]"
                  aria-label="Direct Code Input"
                  disabled={isLoading}
                />
              </div>
            )}
            {inputType === "prompt" && (
              <div className="relative">
                 <MessagesSquare className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Textarea
                  placeholder="Describe your project, its purpose, key functionalities, and any specific technologies you'd like mentioned..."
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                  className="pl-10 text-base min-h-[150px]"
                  aria-label="User Prompt for README Generation"
                  disabled={isLoading}
                />
              </div>
            )}
            <Button type="submit" className="w-full text-lg py-6" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate README"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive" className="shadow-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {savedReadmes.length > 0 && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold font-headline">Saved READMEs</CardTitle>
            <CardDescription>View, download, or delete your previously generated READMEs.</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] w-full rounded-md border p-2">
              <ul className="space-y-3">
                {savedReadmes.map((item) => (
                  <li key={item.id} className="p-3 bg-muted/50 rounded-md shadow-sm hover:bg-muted transition-colors">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-primary">{item.projectName}</p>
                        <p className="text-xs text-muted-foreground">
                          Saved on: {new Date(item.savedDate).toLocaleDateString()} {new Date(item.savedDate).toLocaleTimeString()}
                          {item.inputTypeUsed && ` (via ${item.inputTypeUsed})`}
                        </p>
                      </div>
                      <div className="flex items-center space-x-1 sm:space-x-2">
                        <Button onClick={() => handleLoadReadme(item)} variant="ghost" size="sm" className="text-primary hover:text-primary/80 p-1 sm:p-2" title="View README">
                          <Eye className="mr-0 sm:mr-1 h-4 w-4" /> <span className="hidden sm:inline">View</span>
                        </Button>
                         <Button onClick={() => handleDownloadReadme(item)} variant="outline" size="sm" className="p-1 sm:p-2" title="Download README">
                          <Download className="mr-0 sm:mr-1 h-4 w-4" /> <span className="hidden sm:inline">Download</span>
                        </Button>
                        <Button onClick={() => handleDeleteReadme(item.id)} variant="ghost" size="sm" className="text-destructive hover:text-destructive/80 p-1 sm:p-2" title="Delete README">
                          <Trash2 className="mr-0 sm:mr-1 h-4 w-4" /> <span className="hidden sm:inline">Delete</span>
                        </Button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {generatedReadmeData && !isLoading && (
         <div id="readme-display-card">
            <ReadmeDisplay data={generatedReadmeData} />
         </div>
      )}
    </div>
  );
}

