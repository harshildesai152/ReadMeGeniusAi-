
// src/components/readme-display.tsx
"use client";

import React from 'react';
import type { FullReadmeData } from "@/lib/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Copy, Check, FileText, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

interface ReadmeDisplayProps {
  data: FullReadmeData;
  onGenerateDetails: (currentData: FullReadmeData) => Promise<void>;
  isGeneratingDetails: boolean;
}

// A simple component to render markdown-like text.
const MarkdownContent: React.FC<{ content: string }> = ({ content }) => {
  if (!content && content !== "") return <p className="text-muted-foreground italic text-sm">Not available or empty.</p>;

  const lines = content.split('\n').map((line, index, arr) => {
    // Headings
    if (line.match(/^#{1,6}\s/)) {
        const level = line.match(/^#+/)![0].length;
        const text = line.replace(/^#+\s/, '');
        // Adjusting h-tags: # -> h3, ## -> h4, ### -> h5 for semantic structure within a section
        const Tag = `h${level + 2}` as keyof JSX.IntrinsicElements;
        let headingClass = "font-semibold text-foreground"; // Use text-foreground for default
        if (level === 1) headingClass += " text-lg mt-4 mb-2 underline underline-offset-4 decoration-primary/70"; 
        else if (level === 2) headingClass += " text-base mt-3 mb-1.5 underline underline-offset-2 decoration-primary/50";
        else if (level === 3) headingClass += " text-sm mt-2 mb-1 text-foreground/80";
        else headingClass += " text-xs mt-1.5 mb-0.5 text-foreground/70"; 
        return <Tag key={index} className={headingClass}>{text}</Tag>;
    }
    // Lists
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      return <li key={index} className="ml-6 list-disc space-y-1 my-1 text-foreground/90">{line.substring(line.indexOf(' ') + 1)}</li>;
    }
    // Code blocks
    if (line.trim().startsWith('```')) {
      const isBlockStart = index === 0 || !arr[index - 1].trim().startsWith('```');
      const isBlockEnd = index === arr.length - 1 || !arr[index + 1].trim().startsWith('```');
      if (isBlockStart && isBlockEnd && arr.slice(index + 1).findIndex(l => l.trim().startsWith('```')) === -1 ) {
         return <pre key={index} className="bg-muted/80 p-3.5 rounded-md text-sm overflow-x-auto my-2.5 font-mono shadow-md border border-border/70 text-foreground/90">{line.substring(3).trim()}</pre>;
      }
      return null; 
    }
    if (index > 0 && arr[index-1].trim().startsWith('```') && !arr[index-1].trim().endsWith('```') ) {
        if(index === (arr.slice(0, arr.findIndex((l,i)=> i > index && l.trim().startsWith('```'))).findLastIndex(l => l.trim().startsWith('```')) +1 ) || (index > 0 && arr[index-1].trim().startsWith('```') && arr.findIndex((l,i)=> i > index && l.trim().startsWith('```')) === -1) ){
            const blockLines = [];
            let i = index -1;
            while(i >= 0 && !arr[i].trim().startsWith('```')) i--;
            if(i<0) i=0;
            const lang = arr[i].trim().substring(3);
            let j = i + 1;
            while(j < arr.length && !arr[j].trim().startsWith('```')){
                blockLines.push(arr[j]);
                j++;
            }
            return <pre key={index} className="bg-muted/80 p-3.5 rounded-md text-sm overflow-x-auto my-2.5 font-mono shadow-md border border-border/70 text-foreground/90" data-lang={lang || undefined}>{blockLines.join('\n')}</pre>;
        }
        return null; 
    }
    // For folder structures or indented text (heuristic)
    if (line.trim().startsWith('    ') || line.trim().startsWith('\t') || line.match(/^(\s{2,})[^-\s*]/)) {
      return <p key={index} className="mb-1 whitespace-pre-wrap font-mono text-xs bg-muted/60 p-1.5 rounded border border-border/50 shadow-sm text-foreground/80">{line || <>&nbsp;</>}</p>;
    }
    // Default paragraphs
    return <p key={index} className="mb-2.5 leading-relaxed text-foreground/90">{line || <>&nbsp;</>}</p>;
  });

  const validLines = lines.filter(line => line !== null);
  const structuredLines: (JSX.Element | null)[] = [];
  let inList = false;

  for (const line of validLines) {
    if (React.isValidElement(line) && line.type === 'li') {
      if (!inList) {
        inList = true;
        structuredLines.push(<ul key={`ul-${structuredLines.length}`} className="space-y-0.5 mb-2.5">{line}</ul>);
      } else {
        const lastElement = structuredLines[structuredLines.length - 1];
        if (React.isValidElement(lastElement) && lastElement.type === 'ul') {
          structuredLines[structuredLines.length - 1] = React.cloneElement(lastElement, {}, [...React.Children.toArray(lastElement.props.children), line]);
        }
      }
    } else {
      if (inList) {
        inList = false;
      }
      structuredLines.push(line);
    }
  }

  return <div className="prose prose-sm dark:prose-invert max-w-none">{structuredLines}</div>;
};


export function ReadmeDisplay({ data, onGenerateDetails, isGeneratingDetails }: ReadmeDisplayProps) {
  const { toast } = useToast();
  const [isCopied, setIsCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);


  const formatReadmeForCopy = (readmeData: FullReadmeData): string => {
    let text = `# ${readmeData.projectName}\n\n`;
    text += `## Project Description\n${readmeData.projectDescription}\n\n`;
    text += `## Features\n${readmeData.features}\n\n`;
    text += `## Technologies Used\n${readmeData.technologiesUsed}\n\n`;
    text += `## Folder Structure\n\`\`\`\n${readmeData.folderStructure}\n\`\`\`\n\n`;
    text += `## Setup Instructions\n${readmeData.setupInstructions}\n`;
    return text.trim();
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

  const handleMoreDetailClick = () => {
    if (!mounted || isGeneratingDetails) return;
    onGenerateDetails(data);
  };

  if (!mounted) {
    return null; 
  }

  return (
    <Card className="w-full shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold font-headline text-primary">
          Generated README.md
        </CardTitle>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleMoreDetailClick} 
            disabled={isGeneratingDetails}
            className="bg-secondary text-secondary-foreground hover:bg-secondary/80"
          >
            {isGeneratingDetails ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileText className="mr-2 h-4 w-4" />
            )}
            {isGeneratingDetails ? "Generating..." : "More Detail README"}
          </Button>
          <Button variant="outline" size="sm" onClick={handleCopy} className="bg-accent text-accent-foreground hover:bg-accent/90">
            {isCopied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
            {isCopied ? "Copied!" : "Copy"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] w-full rounded-md border p-4 bg-background">
          <div className="space-y-4"> {/* Increased spacing between sections */}
            <div className="py-3 border-b border-border/50">
              <h2 className="text-xl font-bold text-primary underline decoration-primary/60 underline-offset-4 mb-2.5 font-headline">
                1. Project Name:
              </h2>
              <p className="text-2xl font-bold text-accent-foreground/90 ml-1">{data.projectName}</p> {/* Made project name larger and brighter */}
            </div>

            <div className="py-3 border-b border-border/50">
              <h2 className="text-xl font-bold text-primary underline decoration-primary/60 underline-offset-4 mb-2.5 font-headline">
                2. Project Description:
              </h2>
              <MarkdownContent content={data.projectDescription} />
            </div>

            <div className="py-3 border-b border-border/50">
              <h2 className="text-xl font-bold text-primary underline decoration-primary/60 underline-offset-4 mb-2.5 font-headline">
                3. Features:
              </h2>
              <MarkdownContent content={data.features} />
            </div>

            <div className="py-3 border-b border-border/50">
              <h2 className="text-xl font-bold text-primary underline decoration-primary/60 underline-offset-4 mb-2.5 font-headline">
                4. Technologies Used:
              </h2>
              <MarkdownContent content={data.technologiesUsed} />
            </div>
            
            <div className="py-3 border-b border-border/50">
              <h2 className="text-xl font-bold text-primary underline decoration-primary/60 underline-offset-4 mb-2.5 font-headline">
                5. Folder Structure:
              </h2>
              <MarkdownContent content={data.folderStructure} />
            </div>

            <div className="py-3 last:border-b-0">
              <h2 className="text-xl font-bold text-primary underline decoration-primary/60 underline-offset-4 mb-2.5 font-headline">
                6. Setup Instructions:
              </h2>
              <MarkdownContent content={data.setupInstructions} />
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

