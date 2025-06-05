// src/components/readme-display.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import type { FullReadmeData } from "@/lib/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Check, Edit3, Maximize, Minimize, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// SVG for ClipboardCopy (Copy icon)
const ClipboardCopySvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <rect width="8" height="4" x="8" y="2" rx="1" ry="1"></rect>
  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
</svg>
`;

// SVG for Check icon
const CheckSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <polyline points="20 6 9 17 4 12"></polyline>
</svg>
`;

interface ReadmeDisplayProps {
  data: FullReadmeData;
  onGenerateDetails: (currentData: FullReadmeData) => Promise<void>;
  isGeneratingDetails: boolean;
  onEditRequest: () => void;
}

const MarkdownContent: React.FC<{ content: string; isFullScreen?: boolean; contentWrapperId?: string }> = ({ content, isFullScreen, contentWrapperId }) => {
  if (!content && content !== "") return <p className="text-muted-foreground italic text-xs sm:text-sm">Not available or empty.</p>;

  let htmlContent = content
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/^### (.*$)/gim, `<h4 class="text-sm sm:text-md font-semibold mt-1.5 sm:mt-2 mb-0.5 ${isFullScreen ? 'text-foreground/80' : 'text-primary/80'}">${'$1'}</h4>`)
    .replace(/^## (.*$)/gim, `<h3 class="text-base sm:text-lg font-semibold mt-2 sm:mt-2.5 mb-1 ${isFullScreen ? 'text-foreground/90' : 'text-primary/90'} underline underline-offset-2 decoration-primary/40">${'$1'}</h3>`)
    .replace(/^# (.*$)/gim, `<h2 class="text-lg sm:text-xl font-bold mt-2.5 sm:mt-3 mb-1.5 ${isFullScreen ? 'text-foreground' : 'text-primary'} underline underline-offset-2 sm:underline-offset-4 decoration-primary/50">${'$1'}</h2>`)
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/<u>(.*?)<\/u>/g, '<u>$1</u>')
    .replace(/`([^`]+)`/g, (match, p1) => `<code class="bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-300 px-1.5 py-0.5 rounded text-xs sm:text-sm font-mono shadow-sm border border-border/30">${p1}</code>`)
    .replace(/^(?:(?:- |\* |\+ )\s*.*(?:\n|$))+/gm, (match) => {
      const items = match.trim().split('\n').map(item => `<li class="ml-5 sm:ml-6 list-disc space-y-0.5 my-0.5 sm:my-1 text-xs sm:text-sm ${isFullScreen ? 'text-foreground/90' : 'text-foreground/80 dark:text-foreground/70'}">${item.replace(/^(- |\* |\+ )\s*/, '')}</li>`).join('');
      return `<ul class="space-y-0.5 mb-1.5 sm:mb-2">${items}</ul>`;
    })
    .replace(/^(?:\d+\.\s*.*(?:\n|$))+/gm, (match) => {
      const items = match.trim().split('\n').map(item => `<li class="ml-5 sm:ml-6 list-decimal space-y-0.5 my-0.5 sm:my-1 text-xs sm:text-sm ${isFullScreen ? 'text-foreground/90' : 'text-foreground/80 dark:text-foreground/70'}">${item.replace(/^\d+\.\s*/, '')}</li>`).join('');
      return `<ol class="space-y-0.5 mb-1.5 sm:mb-2">${items}</ol>`;
    })
    .replace(/```([\s\S]*?)```/g, (match, p1, offset) => {
      const uniqueId = `codeblock-${offset}-${Math.random().toString(36).substring(2,9)}`;
      return `
        <div class="code-block-container group relative my-2 rounded-lg shadow-md overflow-hidden bg-neutral-800 dark:bg-black sm:my-3">
          <button 
            class="code-block-copy-button absolute top-1.5 right-1.5 z-10 p-1.5 rounded-md text-neutral-400 hover:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-sky-500 opacity-60 group-hover:opacity-100 transition-opacity duration-150" 
            data-target-id="${uniqueId}"
            data-copy-icon='${ClipboardCopySvg.replace(/'/g, "&apos;")}'
            data-check-icon='${CheckSvg.replace(/'/g, "&apos;")}'
            aria-label="Copy code to clipboard"
          >
            ${ClipboardCopySvg}
          </button>
          <pre id="${uniqueId}" class="text-neutral-200 dark:text-neutral-100 p-3 pt-8 sm:p-4 sm:pt-10 text-xs sm:text-sm overflow-x-auto font-mono">${p1.trim()}</pre>
        </div>
      `;
    })
    .replace(/\n/g, '<br />');

  htmlContent = htmlContent.split('<br />').map(line => {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith('<h') || trimmedLine.startsWith('<ul') || trimmedLine.startsWith('<ol') || trimmedLine.startsWith('<div class="code-block-container') || trimmedLine.startsWith('<li') || trimmedLine === '') {
      return line;
    }
    return `<p class="mb-2 sm:mb-2.5 leading-relaxed text-xs sm:text-sm ${isFullScreen ? 'text-foreground/90' : 'text-foreground/80 dark:text-foreground/70'}">${line}</p>`;
  }).join('<br />').replace(/<br \/>(<p|<div class="code-block-container)/g, '$1').replace(/(<\/p>|<\/div>)<br \/>/g, '$1');

  return <div id={contentWrapperId} className={cn("prose dark:prose-invert max-w-none", isFullScreen ? "text-sm sm:text-base" : "text-xs sm:text-sm")} dangerouslySetInnerHTML={{ __html: htmlContent || '' }} />;
};


export function ReadmeDisplay({ data, onGenerateDetails, isGeneratingDetails, onEditRequest }: ReadmeDisplayProps) {
  const { toast } = useToast();
  const [isCopiedGlobal, setIsCopiedGlobal] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const contentWrapperId = `readme-content-wrapper-${React.useId()}`;

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

  useEffect(() => {
    if (!mounted || !data) return;

    const contentWrapperElement = document.getElementById(contentWrapperId);
    if (!contentWrapperElement) return;

    const copyButtons = contentWrapperElement.querySelectorAll('.code-block-copy-button');
    
    copyButtons.forEach(buttonEl => {
      // Clone and replace to remove old listeners if any
      const newButton = buttonEl.cloneNode(true) as HTMLButtonElement;
      buttonEl.parentNode?.replaceChild(newButton, buttonEl);

      newButton.addEventListener('click', async () => {
        const targetId = newButton.dataset.targetId;
        if (!targetId) return;

        const preElement = contentWrapperElement.querySelector(`#${targetId}`);
        if (preElement && preElement.textContent) {
          try {
            await navigator.clipboard.writeText(preElement.textContent);
            newButton.innerHTML = newButton.dataset.checkIcon || CheckSvg;
            newButton.classList.add('text-green-500');
            toast({
              title: "Code Copied!",
              description: "The code block has been copied to your clipboard.",
            });

            setTimeout(() => {
              newButton.innerHTML = newButton.dataset.copyIcon || ClipboardCopySvg;
              newButton.classList.remove('text-green-500');
            }, 2000);
          } catch (err) {
            console.error("Failed to copy code: ", err);
            toast({
              title: "Error Copying Code",
              description: "Could not copy code to clipboard.",
              variant: "destructive",
            });
          }
        }
      });
    });
  }, [data, isFullScreen, mounted, toast, contentWrapperId]);


  const formatReadmeForCopy = (readmeData: FullReadmeData): string => {
    let text = `# ${readmeData.projectName}\n\n`;
    text += `## Project Description\n${readmeData.projectDescription}\n\n`;
    text += `## Features\n${readmeData.features}\n\n`;
    text += `## Technologies Used\n${readmeData.technologiesUsed}\n\n`;
    text += `## Folder Structure\n\`\`\`\n${readmeData.folderStructure}\n\`\`\`\n\n`;
    text += `## Setup Instructions\n${readmeData.setupInstructions}\n`;
    return text.trim();
  };

  const handleGlobalCopy = () => {
    if (!mounted) return;
    const readmeText = formatReadmeForCopy(data);
    navigator.clipboard.writeText(readmeText)
      .then(() => {
        setIsCopiedGlobal(true);
        toast({
          title: "Copied to clipboard!",
          description: "Full README content has been copied.",
        });
        setTimeout(() => setIsCopiedGlobal(false), 2000);
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
  
  const FileTextIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>`;
  const CopyIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"></rect><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path></svg>`;

  return (
     <Card className={cn(
        "w-full shadow-xl border hover:border-foreground transition-colors duration-200",
        isFullScreen && "fixed inset-0 z-50 m-0 rounded-none border-none flex flex-col h-screen" 
      )}>
      <CardHeader className={cn(
        "flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 pb-3 sm:pb-2",
        isFullScreen && "px-3 sm:px-4 pt-3 sm:pt-4 md:px-6 border-b sticky top-0 bg-background z-10 flex-shrink-0"
      )}>
        <CardTitle className={cn(
            "text-base sm:text-lg md:text-xl font-bold font-headline text-primary",
            isFullScreen && "text-lg sm:text-xl"
            )}>
          {isFullScreen ? data.projectName : "Generated README.md"}
        </CardTitle>
        <div className={cn(
            "flex items-center flex-wrap w-full sm:w-auto",
            "gap-1 justify-start", 
            "sm:gap-2 sm:justify-end" 
          )}>
           <Button
            variant="outline"
            size="sm"
            onClick={handleEditClick}
            className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-2 py-1 sm:text-sm sm:px-3 sm:py-1.5"
            
          >
            <Edit3 className="mr-1 h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleMoreDetailClick}
            disabled={isGeneratingDetails}
            className="bg-secondary text-secondary-foreground hover:bg-secondary/80 text-xs px-2 py-1 sm:text-sm sm:px-3 sm:py-1.5"
            
          >
            {isGeneratingDetails ? (
              <Loader2 className="mr-1 h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
            ) : (
             <span dangerouslySetInnerHTML={{ __html: FileTextIconSvg }} className="mr-1 h-3.5 w-3.5 sm:h-4 sm:w-4 [&_svg]:h-full [&_svg]:w-full"></span>
            )}
            {isGeneratingDetails ? "Generating..." : "More Detail"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleGlobalCopy}
            className="bg-accent text-accent-foreground hover:bg-accent/90 text-xs px-2 py-1 sm:text-sm sm:px-3 sm:py-1.5"
            
          >
            {isCopiedGlobal ? <Check className="mr-1 h-3.5 w-3.5 sm:h-4 sm:w-4" /> : <span dangerouslySetInnerHTML={{ __html: CopyIconSvg }} className="mr-1 h-3.5 w-3.5 sm:h-4 sm:w-4 [&_svg]:h-full [&_svg]:w-full"></span>}
            {isCopiedGlobal ? "Copied!" : "Copy All"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleFullScreen}
            className="bg-muted text-muted-foreground hover:bg-muted/80 text-xs px-2 py-1 sm:text-sm sm:px-3 sm:py-1.5"
          >
            {isFullScreen ? <Minimize className="mr-1 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4" /> : <Maximize className="mr-1 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4" />}
            {isFullScreen ? "Exit Full" : "Full Screen"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className={cn(
         "p-0", // remove padding from here
         isFullScreen && "flex-1 flex flex-col min-h-0" 
        )}>
        <ScrollArea ref={scrollAreaRef} className={cn(
          "h-[calc(100vh-320px)] min-h-[300px] sm:h-[500px] w-full rounded-b-lg bg-background", // Keep rounded-b for non-fullscreen
          isFullScreen && "flex-1 h-auto w-full border-0 rounded-none bg-transparent" 
          )}>
          <div className={cn(
              "space-y-3 sm:space-y-4",
              isFullScreen ? "max-w-4xl mx-auto px-3 py-3 sm:px-6 sm:py-4" : "p-3 sm:p-4" // Apply padding here
            )}>
            {!isFullScreen && (
              <div className="py-1.5 sm:py-2 border-b border-border/50">
                <h2 className="text-md sm:text-lg font-bold text-primary underline decoration-primary/60 underline-offset-2 sm:underline-offset-4 mb-1.5 sm:mb-2 font-headline">
                  1. Project Name:
                </h2>
                <p className="text-lg sm:text-xl font-bold text-accent-foreground/90 ml-1">{data.projectName}</p>
              </div>
            )}
            <MarkdownContent contentWrapperId={contentWrapperId} content={data.projectDescription} isFullScreen={isFullScreen} />
            <MarkdownContent content={data.features} isFullScreen={isFullScreen} />
            <MarkdownContent content={data.technologiesUsed} isFullScreen={isFullScreen} />
            <MarkdownContent content={data.folderStructure} isFullScreen={isFullScreen} />
            <MarkdownContent content={data.setupInstructions} isFullScreen={isFullScreen}/>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
