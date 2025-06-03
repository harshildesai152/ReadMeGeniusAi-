// src/components/readme-generator.tsx
"use client";

import { useState, useEffect, FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertTriangle, Github } from "lucide-react";
import { processGitHubRepo, type FullReadmeData } from "@/lib/actions";
import { ReadmeDisplay } from "./readme-display";

export function ReadmeGenerator() {
  const [repoUrl, setRepoUrl] = useState<string>("");
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

    if (!repoUrl) {
      setError("Please enter a GitHub repository URL.");
      return;
    }
    // Basic URL validation
    try {
      const url = new URL(repoUrl);
      if (url.hostname !== 'github.com') {
        setError("Please enter a valid GitHub repository URL.");
        return;
      }
    } catch (_) {
      setError("Invalid URL format.");
      return;
    }


    setIsLoading(true);
    setError(null);
    setGeneratedReadmeData(null);

    const result = await processGitHubRepo(repoUrl);

    if ("error" in result) {
      setError(result.error);
    } else {
      setGeneratedReadmeData(result);
    }
    setIsLoading(false);
  };

  if (!mounted) {
     // Basic skeleton or loading state for initial mount
    return (
      <div className="w-full max-w-2xl space-y-8">
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center font-headline">Enter GitHub Repository URL</CardTitle>
            <CardDescription className="text-center">
              Let AI craft a professional README for your project.
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
            Enter a public GitHub repository URL and let AI craft a professional README for your project.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
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
