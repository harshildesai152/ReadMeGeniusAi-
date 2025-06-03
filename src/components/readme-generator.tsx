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
import { Loader2, AlertTriangle, Github, FileCode } from "lucide-react";
import { processGitHubRepo, type FullReadmeData } from "@/lib/actions";
import { ReadmeDisplay } from "./readme-display";

type InputType = "url" | "code";

export function ReadmeGenerator() {
  const [inputType, setInputType] = useState<InputType>("url");
  const [repoUrl, setRepoUrl] = useState<string>("");
  const [codeContent, setCodeContent] = useState<string>("");
  const [generatedReadmeData, setGeneratedReadmeData] = useState<FullReadmeData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!mounted) return;

    setError(null);
    setGeneratedReadmeData(null);
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
    } else if (result) {
      setGeneratedReadmeData(result);
    } else {
      setError("An unexpected error occurred.");
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
            Choose your input method and let AI craft a professional README.
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

      {generatedReadmeData && !isLoading && (
        <ReadmeDisplay data={generatedReadmeData} />
      )}
    </div>
  );
}
