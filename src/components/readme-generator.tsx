
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
import { Loader2, AlertTriangle, Github, FileCode, Eye, Trash2, Download } from "lucide-react"; // Added Download, removed Save
import { processGitHubRepo, type FullReadmeData } from "@/lib/actions";
import { ReadmeDisplay } from "./readme-display";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

type InputType = "url" | "code";

interface SavedReadmeItem extends FullReadmeData {
  id: string;
  savedDate: string;
}

export function ReadmeGenerator() {
  const [inputType, setInputType] = useState<InputType>("url");
  const [repoUrl, setRepoUrl] = useState<string>("");
  const [codeContent, setCodeContent] = useState<string>("");
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
          localStorage.removeItem("savedReadmes"); // Clear corrupted data
        }
      }
    }
  }, []);

  useEffect(() => {
    if (mounted && savedReadmes.length > 0) {
      localStorage.setItem("savedReadmes", JSON.stringify(savedReadmes));
    } else if (mounted && savedReadmes.length === 0) {
      localStorage.removeItem("savedReadmes"); // Clean up if no saved readmes
    }
  }, [savedReadmes, mounted]);

  const handleSaveReadme = (readmeToSave: FullReadmeData) => {
    if (!mounted) return;
    const newReadme: SavedReadmeItem = {
      ...readmeToSave,
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      savedDate: new Date().toISOString(),
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
    setError(null); // Clear any previous errors
    toast({
      title: "README Loaded",
      description: `${readmeItem.projectName} is now displayed.`,
    });
    // Scroll to the readme display section
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
    // Sanitize filename: replace non-alphanumeric (excluding underscore) with underscore, convert to lowercase
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
    // Do not clear generatedReadmeData here if we want to keep it displayed while loading new
    // setGeneratedReadmeData(null); 
    setIsLoading(true);

    let result;

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
      result = await processGitHubRepo({ repoUrl });
    } else {
      if (!codeContent.trim()) {
        setError("Please enter some code to analyze.");
        setIsLoading(false);
        return;
      }
      result = await processGitHubRepo({ codeContent });
    }

    if (result && "error" in result) {
      setError(result.error);
      setGeneratedReadmeData(null); // Clear data on error
    } else if (result) {
      setGeneratedReadmeData(result);
      handleSaveReadme(result); // Automatic save on successful generation
    } else {
      setError("An unexpected error occurred.");
      setGeneratedReadmeData(null); // Clear data on error
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
            Choose your input method and let AI craft a professional README. Your generated READMEs are automatically saved.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <RadioGroup
              defaultValue="url"
              onValueChange={(value: string) => setInputType(value as InputType)}
              className="flex space-x-4 mb-4 justify-center"
              aria-label="Input method"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="url" id="url-input" />
                <Label htmlFor="url-input" className="cursor-pointer">GitHub URL</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="code" id="code-input" />
                <Label htmlFor="code-input" className="cursor-pointer">Direct Code</Label>
              </div>
            </RadioGroup>

            {inputType === "url" ? (
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
            ) : (
              <div className="relative">
                <FileCode className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Textarea
                  placeholder="Paste your code snippet here..."
                  value={codeContent}
                  onChange={(e) => setCodeContent(e.target.value)}
                  className="pl-10 text-base min-h-[150px]"
                  aria-label="Direct Code Input"
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
      
      {/* Saved READMEs Section */}
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
                        </p>
                      </div>
                      <div className="flex items-center space-x-1 sm:space-x-2">
                        <Button onClick={() => handleLoadReadme(item)} variant="ghost" size="sm" className="text-primary hover:text-primary/80 p-1 sm:p-2">
                          <Eye className="mr-0 sm:mr-1 h-4 w-4" /> <span className="hidden sm:inline">View</span>
                        </Button>
                         <Button onClick={() => handleDownloadReadme(item)} variant="outline" size="sm" className="p-1 sm:p-2">
                          <Download className="mr-0 sm:mr-1 h-4 w-4" /> <span className="hidden sm:inline">Download</span>
                        </Button>
                        <Button onClick={() => handleDeleteReadme(item.id)} variant="ghost" size="sm" className="text-destructive hover:text-destructive/80 p-1 sm:p-2">
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
         <div id="readme-display-card"> {/* Added id for scrolling */}
            <ReadmeDisplay data={generatedReadmeData} />
         </div>
      )}
    </div>
  );
}
