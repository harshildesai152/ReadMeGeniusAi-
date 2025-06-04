
// src/components/readme-generator.tsx
"use client";

import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, AlertTriangle, Github, FileCode, Eye, Trash2, Download, MessagesSquare, UploadCloud, File as FileIcon } from "lucide-react";
import { processGitHubRepo, type FullReadmeData } from "@/lib/actions";
import { ReadmeDisplay } from "./readme-display";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { isLoggedIn, getCurrentUserEmail } from "@/lib/auth/storage"; // Added getCurrentUserEmail
import { useRouter } from "next/navigation";

type InputType = "url" | "code" | "prompt";

interface SavedReadmeItem extends FullReadmeData {
  id: string;
  savedDate: string;
  inputTypeUsed?: InputType; 
  originalInput?: string; 
  originalFileNames?: string[];
}

interface UploadedFile {
  name: string;
  content: string;
  size: number;
}

export function ReadmeGenerator() {
  const [inputType, setInputType] = useState<InputType>("url");
  const [repoUrl, setRepoUrl] = useState<string>("");
  const [userPrompt, setUserPrompt] = useState<string>("");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [generatedReadmeData, setGeneratedReadmeData] = useState<FullReadmeData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [savedReadmes, setSavedReadmes] = useState<SavedReadmeItem[]>([]);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const loggedIn = isLoggedIn();
      if (loggedIn) {
        const userEmail = getCurrentUserEmail();
        if (userEmail) {
          const userSavedReadmesKey = `savedReadmes_${userEmail}`;
          const storedReadmes = localStorage.getItem(userSavedReadmesKey);
          if (storedReadmes) {
            try {
              setSavedReadmes(JSON.parse(storedReadmes));
            } catch (e) {
              console.error(`Failed to parse saved READMEs for ${userEmail} from localStorage`, e);
              localStorage.removeItem(userSavedReadmesKey);
              setSavedReadmes([]);
            }
          } else {
            setSavedReadmes([]); // No READMEs saved for this user yet
          }
        } else {
          setSavedReadmes([]); // Should not happen if loggedIn is true, but good practice
        }
      } else {
        setSavedReadmes([]); // Not logged in, so no READMEs to display
      }
    }
  }, []); // Runs once on mount

  useEffect(() => {
    if (mounted) {
      const loggedIn = isLoggedIn();
      if (loggedIn) {
        const userEmail = getCurrentUserEmail();
        if (userEmail) {
          const userSavedReadmesKey = `savedReadmes_${userEmail}`;
          if (savedReadmes.length > 0) {
            localStorage.setItem(userSavedReadmesKey, JSON.stringify(savedReadmes));
          } else {
            localStorage.removeItem(userSavedReadmesKey); // Clear if list becomes empty for this user
          }
        }
      }
      // If not logged in, don't attempt to save to localStorage
    }
  }, [savedReadmes, mounted]);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!mounted) return;
    const files = event.target.files;
    if (!files || files.length === 0) {
      setUploadedFiles([]);
      return;
    }

    const newFileDetails: UploadedFile[] = [];
    const fileReadPromises: Promise<UploadedFile>[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      fileReadPromises.push(
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            resolve({
              name: file.name,
              content: reader.result as string,
              size: file.size,
            });
          };
          reader.onerror = (error) => reject(error);
          reader.readAsText(file);
        })
      );
    }

    try {
      const results = await Promise.all(fileReadPromises);
      setUploadedFiles(results);
      setError(null); 
    } catch (e) {
      console.error("Error reading files:", e);
      setError("Error reading one or more files. Please ensure they are text files.");
      setUploadedFiles([]);
    }
     if (event.target) {
      event.target.value = ""; 
    }
  };

  const formatFileSize = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const handleRemoveUploadedFile = (fileName: string) => {
    setUploadedFiles(prev => prev.filter(f => f.name !== fileName));
  };


  const handleSaveReadme = (readmeToSave: FullReadmeData, inputTypeUsed: InputType, originalInput: string, originalFileNames?: string[]) => {
    if (!mounted || !isLoggedIn() || !getCurrentUserEmail()) return; // Ensure user is logged in
    
    const newReadme: SavedReadmeItem = {
      ...readmeToSave,
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      savedDate: new Date().toISOString(),
      inputTypeUsed,
      originalInput,
      originalFileNames,
    };
    setSavedReadmes((prev) => [newReadme, ...prev.slice(0, 19)]); // Keep latest 20 per user
    toast({
      title: "README Automatically Saved!",
      description: `${newReadme.projectName} has been added to your saved list.`,
    });
  };

  const handleDeleteReadme = (id: string) => {
    if (!mounted || !isLoggedIn() || !getCurrentUserEmail()) return;
    setSavedReadmes((prev) => prev.filter((item) => item.id !== id));
    toast({
      title: "README Deleted",
      description: "The saved README has been removed.",
      variant: "destructive",
    });
  };

  const handleLoadReadme = (readmeItem: SavedReadmeItem) => {
    if (!mounted || !isLoggedIn() || !getCurrentUserEmail()) return;
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

    if (!isLoggedIn()) {
      toast({
        title: "Authentication Required",
        description: "Please log in to generate a README.",
        variant: "destructive",
      });
      router.push('/auth/login');
      return;
    }

    setError(null);
    setIsLoading(true);
    setGeneratedReadmeData(null);

    let result;
    let originalInputValue = "";
    let fileNamesForSave: string[] | undefined = undefined;

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
      if (uploadedFiles.length === 0) {
        setError("Please upload at least one code file.");
        setIsLoading(false);
        return;
      }
      const combinedCodeContent = uploadedFiles.map(file => `// FILE_START: ${file.name}\n\n${file.content}\n\n// FILE_END: ${file.name}`).join('\n\n---\n\n');
      originalInputValue = `Uploaded files: ${uploadedFiles.map(f => f.name).join(', ')}`; 
      fileNamesForSave = uploadedFiles.map(f => f.name);
      result = await processGitHubRepo({ codeContent: combinedCodeContent });
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
      handleSaveReadme(result, inputType, originalInputValue, fileNamesForSave);
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
            Choose your input method. Generated READMEs are automatically saved. Login required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <RadioGroup
              defaultValue="url"
              onValueChange={(value: string) => {
                setInputType(value as InputType);
                setError(null); 
                setGeneratedReadmeData(null);
                setUploadedFiles([]); 
              }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 justify-center"
              aria-label="Input method"
            >
              <Label htmlFor="url-input" className={`flex items-center justify-center space-x-2 p-3 border rounded-md cursor-pointer hover:bg-accent hover:text-accent-foreground ${inputType === 'url' ? 'bg-accent text-accent-foreground ring-2 ring-ring' : 'bg-background'}`}>
                <RadioGroupItem value="url" id="url-input" className="sr-only" />
                <Github className="h-5 w-5" />
                <span>GitHub URL</span>
              </Label>
              <Label htmlFor="code-input" className={`flex items-center justify-center space-x-2 p-3 border rounded-md cursor-pointer hover:bg-accent hover:text-accent-foreground ${inputType === 'code' ? 'bg-accent text-accent-foreground ring-2 ring-ring' : 'bg-background'}`}>
                <RadioGroupItem value="code" id="code-input" className="sr-only" />
                <UploadCloud className="h-5 w-5" />
                <span>Upload Files</span>
              </Label>
              <Label htmlFor="prompt-input" className={`flex items-center justify-center space-x-2 p-3 border rounded-md cursor-pointer hover:bg-accent hover:text-accent-foreground ${inputType === 'prompt' ? 'bg-accent text-accent-foreground ring-2 ring-ring' : 'bg-background'}`}>
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
              <div className="space-y-4">
                <div className="relative">
                  <label htmlFor="file-upload-readme-gen" className="sr-only">Upload code files</label>
                  <Input
                    id="file-upload-readme-gen"
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                    disabled={isLoading}
                  />
                   <p className="mt-1 text-xs text-muted-foreground">
                    Select one or more code files. Content will be combined for analysis.
                  </p>
                </div>
                {uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Selected files:</h4>
                    <ScrollArea className="h-[100px] w-full rounded-md border p-2 bg-muted/30">
                      <ul className="space-y-1">
                        {uploadedFiles.map((file) => (
                          <li key={file.name} className="flex justify-between items-center p-1.5 bg-background rounded shadow-sm text-xs">
                            <div className="flex items-center gap-1.5">
                              <FileIcon className="h-4 w-4 text-primary" />
                              <span className="font-medium truncate max-w-[200px] sm:max-w-[300px]">{file.name}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-muted-foreground">{formatFileSize(file.size)}</span>
                              <Button variant="ghost" size="icon" onClick={() => handleRemoveUploadedFile(file.name)} className="h-6 w-6 text-destructive hover:text-destructive/80" title="Remove file" disabled={isLoading}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </ScrollArea>
                  </div>
                )}
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
      
      {isLoggedIn() && getCurrentUserEmail() && savedReadmes.length > 0 && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold font-headline">Saved READMEs</CardTitle>
            <CardDescription>View, download, or delete your previously generated READMEs. (Visible only to you)</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] w-full rounded-md border p-2">
              <ul className="space-y-3">
                {savedReadmes.map((item) => (
                  <li key={item.id} className="p-3 bg-muted/50 rounded-md shadow-sm hover:bg-muted transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-primary truncate" title={item.projectName}>{item.projectName}</p>
                        <p className="text-xs text-muted-foreground">
                          Saved: {new Date(item.savedDate).toLocaleDateString()} {new Date(item.savedDate).toLocaleTimeString()}
                          {item.inputTypeUsed && ` (via ${item.inputTypeUsed}${item.inputTypeUsed === 'code' && item.originalFileNames && item.originalFileNames.length > 0 ? `: ${item.originalFileNames.join(', ').substring(0,50)}...` : ''})`}
                        </p>
                      </div>
                      <div className="flex items-center space-x-1 sm:space-x-2 ml-2 flex-shrink-0">
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

