// src/components/readme-display.tsx
"use client";

import type { FullReadmeData } from "@/lib/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Copy, Check } from "lucide-react";
import { useState, useEffect } from "react";

interface ReadmeDisplayProps {
  data: FullReadmeData;
}

// A simple component to render markdown-like text.
// For a full markdown experience, a library like react-markdown would be better.
const MarkdownContent: React.FC<{ content: string }> = ({ content }) => {
  // Split content by newlines and render each line, preserving some structure.
  // Replace common markdown list items for better display.
  const lines = content.split('\n').map((line, index) => {
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      return <li key={index} className="ml-4 list-disc">{line.substring(line.indexOf(' ') + 1)}</li>;
    }
    if (line.match(/^#{1,6}\s/)) { // Basic heading support
        const level = line.match(/^#+/)![0].length;
        const text = line.replace(/^#+\s/, '');
        const Tag = `h${level + 1}` as keyof JSX.IntrinsicElements; // h2, h3 etc.
        return <Tag key={index} className={`font-semibold mt-2 mb-1 ${level === 1 ? 'text-xl' : level === 2 ? 'text-lg' : 'text-base'}`}>{text}</Tag>;
    }
    return <p key={index} className="mb-1">{line || <>&nbsp;</>}</p>; // Render empty line as a small break
  });

  return <div className="prose prose-sm dark:prose-invert max-w-none">{lines}</div>;
};


export function ReadmeDisplay({ data }: ReadmeDisplayProps) {
  const { toast } = useToast();
  const [isCopied, setIsCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);


  const formatReadmeForCopy = (readmeData: FullReadmeData): string => {
    return `
# ${readmeData.projectName}

## Project Description
${readmeData.projectDescription}

## Project Features
${readmeData.features}

## Project Technologies
${readmeData.technologiesUsed}

## To run this project locally, follow these steps:
${readmeData.setupInstructions}
    `.trim();
  };

  const handleCopy = () => {
    if (!mounted) return;
    const readmeText = formatReadmeForCopy(data);
    navigator.clipboard.writeText(readmeText)
      .then(() => {
        setIsCopied(true);
        toast({
          title: "Copied to clipboard!",
          description: "README content has been copied.",
        });
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch(err => {
        console.error("Failed to copy: ", err);
        toast({
          title: "Error copying",
          description: "Could not copy content to clipboard.",
          variant: "destructive",
        });
      });
  };

  if (!mounted) {
    return null; // Or a loading skeleton
  }

  return (
    <Card className="w-full shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold font-headline">
          Generated README.md
        </CardTitle>
        <Button variant="outline" size="sm" onClick={handleCopy} className="bg-accent text-accent-foreground hover:bg-accent/90">
          {isCopied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
          {isCopied ? "Copied!" : "Copy"}
        </Button>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] w-full rounded-md border p-4 bg-background">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2 pb-1 border-b font-headline">
                1. Project Name:
              </h2>
              <p className="text-lg font-bold text-primary">{data.projectName}</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2 pb-1 border-b font-headline">
                2. Project Description:
              </h2>
              <MarkdownContent content={data.projectDescription} />
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2 pb-1 border-b font-headline">
                3. Project Features:
              </h2>
              <MarkdownContent content={data.features} />
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2 pb-1 border-b font-headline">
                4. Project Technologies:
              </h2>
              <MarkdownContent content={data.technologiesUsed} />
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2 pb-1 border-b font-headline">
                5. To run this project locally, follow these steps:
              </h2>
              <MarkdownContent content={data.setupInstructions} />
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
