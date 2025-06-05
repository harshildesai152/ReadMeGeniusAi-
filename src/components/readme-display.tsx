
// src/components/readme-display.tsx
"use client";

import React, { useState, useEffect } from 'react'; // Ensured React is imported
import type { FullReadmeData } from "@/lib/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Copy, Check, FileText as FileTextIcon, Loader2, Edit3, Maximize, Minimize } from "lucide-react";
import { cn } from "@/lib/utils";


interface ReadmeDisplayProps {
  data: FullReadmeData;
  onGenerateDetails: (currentData: FullReadmeData) => Promise<void>;
  isGeneratingDetails: boolean;
  onEditRequest: () => void;
}

// A simple component to render markdown-like text.
const MarkdownContent: React.FC<{ content: string; isFullScreen?: boolean }> = ({ content, isFullScreen }) => {
  if (!content && content !== "") return <p className="text-muted-foreground italic text-sm">Not available or empty.</p>;

  let htmlContent = content
    .replace(/^### (.*$)/gim, `<h4 class="text-sm sm:text-base font-semibold mt-2 sm:mt-2.5 mb-0.5 sm:mb-1 ${isFullScreen ? 'text-foreground' : 'text-primary/80'}">${'$1'}</h4>`)
    .replace(/^## (.*$)/gim, `<h3 class="text-base sm:text-lg font-semibold mt-2.5 sm:mt-3 mb-1 sm:mb-1.5 ${isFullScreen ? 'text-foreground' : 'text-primary/90'} underline underline-offset-2 decoration-primary/50">${'$1'}</h3>`)
    .replace(/^# (.*$)/gim, `<h2 class="text-lg sm:text-xl font-bold mt-3 sm:mt-4 mb-1.5 sm:mb-2 ${isFullScreen ? 'text-foreground' : 'text-primary'} underline underline-offset-2 sm:underline-offset-4 decoration-primary/60">${'$1'}</h2>`)
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
    .replace(/\*(.*?)\*/g, '<em>$1</em>')     
    .replace(/`([^`]+)`/g, '<code class="bg-muted/70 px-1 py-0.5 rounded text-xs sm:text-sm font-mono">$1</code>') 
    .replace(/^(?:(?:- |\* |\+ )\s*.*(?:\n|$))+/gm, (match) => { 
      const items = match.trim().split('\n').map(item => `<li class="ml-4 sm:ml-6 list-disc space-y-0.5 sm:space-y-1 my-0.5 sm:my-1 text-sm ${isFullScreen ? 'text-foreground/90' : 'text-foreground/90'}">${item.replace(/^(- |\* |\+ )\s*/, '')}</li>`).join('');
      return `<ul class="space-y-0.5 mb-2 sm:mb-2.5">${items}</ul>`;
    })
    .replace(/^(?:\d+\.\s*.*(?:\n|$))+/gm, (match) => { 
        const items = match.trim().split('\n').map(item => `<li class="ml-4 sm:ml-6 list-decimal space-y-0.5 sm:space-y-1 my-0.5 sm:my-1 text-sm ${isFullScreen ? 'text-foreground/90' : 'text-foreground/90'}">${item.replace(/^\d+\.\s*/, '')}</li>`).join('');
        return `<ol class="space-y-0.5 mb-2 sm:mb-2.5">${items}</ol>`;
    })
    .replace(/```([\s\S]*?)```/g, (match, p1) => `<pre class="bg-muted/80 p-2 sm:p-3.5 rounded-md text-xs sm:text-sm overflow-x-auto my-2 sm:my-2.5 font-mono shadow-md border border-border/70 ${isFullScreen ? 'text-foreground/90' : 'text-foreground/90'}">${p1.trim().replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>`) 
    .replace(/<u>(.*?)<\/u>/g, '<u>$1</u>') 
    .replace(/\n/g, '<br />'); 

  htmlContent = htmlContent.split('<br />').map(line => {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith('<h') || trimmedLine.startsWith('<ul') || trimmedLine.startsWith('<ol') || trimmedLine.startsWith('<pre') || trimmedLine.startsWith('<li') || trimmedLine === '') {
      return line;
    }
    return `<p class="mb-2 sm:mb-2.5 leading-relaxed text-sm ${isFullScreen ? 'text-foreground/90' : 'text-foreground/90'}">${line}</p>`;
  }).join('<br />').replace(/<br \/>(<p)/g, '$1').replace(/(<\/p>)<br \/>/g, '$1');


  return <div className="prose prose-sm dark:prose-invert max-w-none text-sm sm:text-base" dangerouslySetInnerHTML={{ __html: htmlContent || '' }} />;
};


export function ReadmeDisplay({ data, onGenerateDetails, isGeneratingDetails, onEditRequest }: ReadmeDisplayProps) {
  const { toast } = useToast();
  const [isCopied, setIsCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isFullScreen) {
        setIsFullScreen(false);
      }
    };

    if (isFullScreen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleEsc);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isFullScreen, mounted]);


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
  
  const handleEditClick = () => {
    if (!mounted || isGeneratingDetails) return;
    onEditRequest();
  };

  const toggleFullScreen = () => {
    if (!mounted) return;
    setIsFullScreen(!isFullScreen);
  }

  if (!mounted) {
    return null; 
  }

  return (
    <Card className={cn(
        "w-full shadow-xl", 
        isFullScreen && "fixed inset-0 z-50 m-0 rounded-none border-none flex flex-col overflow-y-auto"
      )}>
      <CardHeader className={cn(
        "flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 pb-2",
        isFullScreen && "px-2 sm:px-4 pt-2 sm:pt-4 md:px-6 border-b sticky top-0 bg-background z-10"
      )}>
        <CardTitle className={cn(
            "text-xl sm:text-2xl font-bold font-headline text-primary",
            isFullScreen && "text-lg sm:text-xl"
            )}>
          {isFullScreen ? data.projectName : "Generated README.md"}
        </CardTitle>
        <div className="flex items-center space-x-1 sm:space-x-2 flex-wrap justify-start sm:justify-end w-full sm:w-auto">
           <Button 
            variant="outline" 
            size="sm" 
            onClick={handleEditClick} 
            className="bg-blue-500 hover:bg-blue-600 text-white text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5"
          >
            <Edit3 className="mr-1 sm:mr-2 h-3.5 sm:h-4 w-3.5 sm:w-4" />
            Edit
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleMoreDetailClick} 
            disabled={isGeneratingDetails}
            className="bg-secondary text-secondary-foreground hover:bg-secondary/80 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5"
          >
            {isGeneratingDetails ? (
              <Loader2 className="mr-1 sm:mr-2 h-3.5 sm:h-4 w-3.5 sm:w-4 animate-spin" />
            ) : (
              <FileTextIcon className="mr-1 sm:mr-2 h-3.5 sm:h-4 w-3.5 sm:w-4" />
            )}
            {isGeneratingDetails ? "Generating..." : "More Detail"}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleCopy} 
            className="bg-accent text-accent-foreground hover:bg-accent/90 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5"
          >
            {isCopied ? <Check className="mr-1 sm:mr-2 h-3.5 sm:h-4 w-3.5 sm:w-4" /> : <Copy className="mr-1 sm:mr-2 h-3.5 sm:h-4 w-3.5 sm:w-4" />}
            {isCopied ? "Copied!" : "Copy"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleFullScreen}
            className="bg-muted text-muted-foreground hover:bg-muted/80 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5"
          >
            {isFullScreen ? <Minimize className="mr-1 sm:mr-2 h-3.5 sm:h-4 w-3.5 sm:w-4" /> : <Maximize className="mr-1 sm:mr-2 h-3.5 sm:h-4 w-3.5 sm:w-4" />}
            {isFullScreen ? "Exit Full" : "Full Screen"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className={cn(isFullScreen && "flex-grow p-2 sm:p-4 md:p-6")}>
        <ScrollArea className={cn(
          "h-[calc(100vh-280px)] sm:h-[500px] w-full rounded-md border p-3 sm:p-4 bg-background",
          isFullScreen && "h-full w-full border-0 rounded-none p-0 bg-transparent"
          )}>
          <div className={cn("space-y-3 sm:space-y-4", isFullScreen && "max-w-4xl mx-auto")}> 
            {!isFullScreen && (
              <div className="py-2 sm:py-3 border-b border-border/50">
                <h2 className="text-lg sm:text-xl font-bold text-primary underline decoration-primary/60 underline-offset-2 sm:underline-offset-4 mb-2 sm:mb-2.5 font-headline">
                  1. Project Name:
                </h2>
                <p className="text-xl sm:text-2xl font-bold text-accent-foreground/90 ml-1">{data.projectName}</p> 
              </div>
            )}

            <div className={cn(!isFullScreen && "py-2 sm:py-3 border-b border-border/50")}>
              {!isFullScreen && (
                <h2 className="text-lg sm:text-xl font-bold text-primary underline decoration-primary/60 underline-offset-2 sm:underline-offset-4 mb-2 sm:mb-2.5 font-headline">
                  {isFullScreen ? "Project Description" : "2. Project Description:"}
                </h2>
              )}
               {isFullScreen && <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-3 sm:mb-4 mt-1 sm:mt-2">{data.projectName}</h1>}
              <MarkdownContent content={data.projectDescription} isFullScreen={isFullScreen} />
            </div>

            <div className={cn(!isFullScreen && "py-2 sm:py-3 border-b border-border/50")}>
              <h2 className={cn(
                !isFullScreen && "text-lg sm:text-xl font-bold text-primary underline decoration-primary/60 underline-offset-2 sm:underline-offset-4 mb-2 sm:mb-2.5 font-headline",
                isFullScreen && "text-xl sm:text-2xl font-semibold text-primary mt-4 sm:mt-6 mb-2 sm:mb-3"
              )}>
                {isFullScreen ? "Features" : "3. Features:"}
              </h2>
              <MarkdownContent content={data.features} isFullScreen={isFullScreen} />
            </div>

            <div className={cn(!isFullScreen && "py-2 sm:py-3 border-b border-border/50")}>
              <h2 className={cn(
                !isFullScreen && "text-lg sm:text-xl font-bold text-primary underline decoration-primary/60 underline-offset-2 sm:underline-offset-4 mb-2 sm:mb-2.5 font-headline",
                 isFullScreen && "text-xl sm:text-2xl font-semibold text-primary mt-4 sm:mt-6 mb-2 sm:mb-3"
              )}>
                {isFullScreen ? "Technologies Used" : "4. Technologies Used:"}
              </h2>
              <MarkdownContent content={data.technologiesUsed} isFullScreen={isFullScreen} />
            </div>
            
            <div className={cn(!isFullScreen && "py-2 sm:py-3 border-b border-border/50")}>
              <h2 className={cn(
                !isFullScreen && "text-lg sm:text-xl font-bold text-primary underline decoration-primary/60 underline-offset-2 sm:underline-offset-4 mb-2 sm:mb-2.5 font-headline",
                isFullScreen && "text-xl sm:text-2xl font-semibold text-primary mt-4 sm:mt-6 mb-2 sm:mb-3"
              )}>
                {isFullScreen ? "Folder Structure" : "5. Folder Structure:"}
              </h2>
              <MarkdownContent content={data.folderStructure} isFullScreen={isFullScreen} />
            </div>

            <div className={cn(!isFullScreen && "py-2 sm:py-3 last:border-b-0")}>
              <h2 className={cn(
                !isFullScreen && "text-lg sm:text-xl font-bold text-primary underline decoration-primary/60 underline-offset-2 sm:underline-offset-4 mb-2 sm:mb-2.5 font-headline",
                 isFullScreen && "text-xl sm:text-2xl font-semibold text-primary mt-4 sm:mt-6 mb-2 sm:mb-3"
              )}>
                {isFullScreen ? "Setup Instructions" : "6. Setup Instructions:"}
              </h2>
              <MarkdownContent content={data.setupInstructions} isFullScreen={isFullScreen}/>
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
