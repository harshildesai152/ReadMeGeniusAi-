// src/components/readme-display.tsx
"use client";

import React from 'react'; // Added import
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
const MarkdownContent: React.FC<{ content: string }> = ({ content }) => {
  if (!content && content !== "") return <p className="text-muted-foreground italic text-sm">Not available or empty.</p>;

  const lines = content.split('\n').map((line, index, arr) => {
    // Headings
    if (line.match(/^#{1,6}\s/)) {
        const level = line.match(/^#+/)![0].length;
        const text = line.replace(/^#+\s/, '');
        const Tag = `h${level + 2}` as keyof JSX.IntrinsicElements; // Start from h3 for these sections
        let headingClass = "font-semibold";
        if (level === 1) headingClass += " text-lg mt-3 mb-1.5"; // ##
        else if (level === 2) headingClass += " text-base mt-2.5 mb-1"; // ###
        else headingClass += " text-sm mt-2 mb-0.5"; // ####+
        return <Tag key={index} className={headingClass}>{text}</Tag>;
    }
    // Lists
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      return <li key={index} className="ml-5 list-disc space-y-0.5">{line.substring(line.indexOf(' ') + 1)}</li>;
    }
    // Code blocks (simple heuristic for ``` blocks)
    if (line.trim().startsWith('```')) {
      const isBlockStart = index === 0 || !arr[index - 1].trim().startsWith('```');
      const isBlockEnd = index === arr.length - 1 || !arr[index + 1].trim().startsWith('```');
      if (isBlockStart && isBlockEnd && arr.slice(index + 1).findIndex(l => l.trim().startsWith('```')) === -1 ) {
         return <pre key={index} className="bg-muted/70 p-3 rounded-md text-sm overflow-x-auto my-2 font-mono shadow-sm">{line.substring(3).trim()}</pre>;
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
            return <pre key={index} className="bg-muted/70 p-3 rounded-md text-sm overflow-x-auto my-2 font-mono shadow-sm" data-lang={lang || undefined}>{blockLines.join('\n')}</pre>;
        }
        return null; 
    }
    
    // Indented lines for folder structure or simple code
    if (line.trim().startsWith('    ') || line.trim().startsWith('\t') || line.match(/^(\s{2,})[^-\s*]/)) {
      return <p key={index} className="mb-0.5 whitespace-pre-wrap font-mono text-sm bg-muted/50 p-1 rounded">{line || <>&nbsp;</>}</p>;
    }
    // Default paragraphs
    return <p key={index} className="mb-2 leading-relaxed">{line || <>&nbsp;</>}</p>;
  });

  const validLines = lines.filter(line => line !== null);
  const structuredLines: (JSX.Element | null)[] = [];
  let inList = false;

  for (const line of validLines) {
    if (React.isValidElement(line) && line.type === 'li') {
      if (!inList) {
        inList = true;
        structuredLines.push(<ul key={`ul-${structuredLines.length}`} className="space-y-0.5 mb-2">{line}</ul>);
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


export function ReadmeDisplay({ data }: ReadmeDisplayProps) {
  const { toast } = useToast();
  const [isCopied, setIsCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);


  const formatReadmeForCopy = (readmeData: FullReadmeData): string => {
    // Basic Markdown formatting for copy
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

  if (!mounted) {
    return null; 
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
          <div className="space-y-3">
            <div className="py-3 border-b border-border/50">
              <h2 className="text-xl font-semibold mb-2 pb-1 font-headline">
                1. Project Name:
              </h2>
              <p className="text-lg font-bold text-primary">{data.projectName}</p>
            </div>

            <div className="py-3 border-b border-border/50">
              <h2 className="text-xl font-semibold mb-2 pb-1 font-headline">
                2. Project Description:
              </h2>
              <MarkdownContent content={data.projectDescription} />
            </div>

            <div className="py-3 border-b border-border/50">
              <h2 className="text-xl font-semibold mb-2 pb-1 font-headline">
                3. Features:
              </h2>
              <MarkdownContent content={data.features} />
            </div>

            <div className="py-3 border-b border-border/50">
              <h2 className="text-xl font-semibold mb-2 pb-1 font-headline">
                4. Technologies Used:
              </h2>
              <MarkdownContent content={data.technologiesUsed} />
            </div>
            
            <div className="py-3 border-b border-border/50">
              <h2 className="text-xl font-semibold mb-2 pb-1 font-headline">
                5. Folder Structure:
              </h2>
              <MarkdownContent content={data.folderStructure} />
            </div>

            <div className="py-3 last:border-b-0">
              <h2 className="text-xl font-semibold mb-2 pb-1 font-headline">
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
