
// src/components/readme-display.tsx
"use client";

import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import type { FullReadmeData } from "@/lib/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Check, Edit3, Maximize, Minimize, Loader2, EyeIcon, CodeIcon, Palette, ImageUp, CircleX, DownloadCloud } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const ClipboardCopySvgIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"></rect><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path></svg>`;
const CheckSvgIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
const FileTextIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>`;


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
    .replace(/^### (.*$)/gim, `<h4 class="text-sm sm:text-base font-semibold mt-2.5 mb-1 ${isFullScreen ? 'text-foreground/90' : 'text-primary/90'}">${'$1'}</h4>`)
    .replace(/^## (.*$)/gim, `<h3 class="text-base sm:text-lg font-semibold mt-3 mb-1.5 ${isFullScreen ? 'text-foreground' : 'text-primary'} underline underline-offset-2 decoration-primary/40">${'$1'}</h3>`)
    .replace(/^# (.*$)/gim, `<h2 class="text-lg sm:text-xl font-semibold mt-4 mb-2 ${isFullScreen ? 'text-foreground' : 'text-primary'} underline underline-offset-4 decoration-primary/50">${'$1'}</h2>`)
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/<u>(.*?)<\/u>/g, '<u>$1</u>')
    .replace(/`([^`]+)`/g, (match, p1) => `<code class="bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-300 px-1.5 py-0.5 rounded text-xs sm:text-sm font-mono shadow-sm border border-border/30">${p1}</code>`)
    .replace(/^(?:(?:- |\* |\+ )\s*.*(?:\n|$))+/gm, (match) => {
      const items = match.trim().split('\n').map(item => `<li class="ml-5 sm:ml-6 list-disc my-1 text-xs sm:text-sm ${isFullScreen ? 'text-foreground/90' : 'text-foreground/80 dark:text-foreground/70'}">${item.replace(/^(- |\* |\+ )\s*/, '')}</li>`).join('');
      return `<ul class="mb-2">${items}</ul>`;
    })
    .replace(/^(?:\d+\.\s*.*(?:\n|$))+/gm, (match) => {
      const items = match.trim().split('\n').map(item => `<li class="ml-5 sm:ml-6 list-decimal my-1 text-xs sm:text-sm ${isFullScreen ? 'text-foreground/90' : 'text-foreground/80 dark:text-foreground/70'}">${item.replace(/^\d+\.\s*/, '')}</li>`).join('');
      return `<ol class="mb-2">${items}</ol>`;
    })
    .replace(/```([\s\S]*?)```/g, (match, p1, offset) => {
      const uniqueId = `codeblock-${contentWrapperId || 'global'}-${offset}-${Math.random().toString(36).substring(2,9)}`;
      return `
        <div class="code-block-container group relative my-2 sm:my-3 rounded-lg shadow-md overflow-hidden bg-neutral-800 dark:bg-black">
          <button
            class="code-block-copy-button absolute top-1.5 right-1.5 z-10 p-1.5 rounded-md text-neutral-400 hover:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-sky-500 opacity-60 group-hover:opacity-100 transition-opacity duration-150"
            data-target-id="${uniqueId}"
            data-copy-icon='${ClipboardCopySvgIcon.replace(/'/g, "&apos;")}'
            data-check-icon='${CheckSvgIcon.replace(/'/g, "&apos;")}'
            aria-label="Copy code to clipboard"
          >
            ${ClipboardCopySvgIcon}
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
    return `<p class="mb-2 sm:mb-2.5 leading-relaxed text-xs sm:text-sm ${isFullScreen ? 'text-foreground/90' : 'text-foreground/80 dark:text-foreground/70'}">${line || <>&nbsp;</>}</p>`;
  }).join('<br />').replace(/<br \/>(<p|<div class="code-block-container)/g, '$1').replace(/(<\/p>|<\/div>)<br \/>/g, '$1');

  return <div id={contentWrapperId} className={cn("prose dark:prose-invert max-w-none", isFullScreen ? "text-sm sm:text-base" : "text-xs sm:text-sm")} dangerouslySetInnerHTML={{ __html: htmlContent || '' }} />;
};


export function ReadmeDisplay({ data, onGenerateDetails, isGeneratingDetails, onEditRequest }: ReadmeDisplayProps) {
  const { toast } = useToast();
  const [isCopiedGlobal, setIsCopiedGlobal] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [viewMode, setViewMode] = useState<'formatted' | 'raw'>('formatted');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const contentWrapperId = `readme-content-wrapper-${React.useId()}`;

  const [customLogoDataUri, setCustomLogoDataUri] = useState<string | null>(null);
  const [selectedThemeColor, setSelectedThemeColor] = useState<string>("#4285F4"); // Default to app primary
  const [isBrandingDialogOpen, setIsBrandingDialogOpen] = useState<boolean>(false);
  const [isGeneratingBrandedPdf, setIsGeneratingBrandedPdf] = useState<boolean>(false);


  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const handleEsc = (event: KeyboardEvent) => { if (event.key === 'Escape' && isFullScreen) setIsFullScreen(false); };
    if (isFullScreen) { document.body.style.overflow = 'hidden'; document.addEventListener('keydown', handleEsc); }
    else { document.body.style.overflow = ''; }
    return () => { document.body.style.overflow = ''; document.removeEventListener('keydown', handleEsc); };
  }, [isFullScreen, mounted]);

  useEffect(() => {
    if (!mounted || !data || viewMode === 'raw') return;
    const mainContentDisplayArea = document.getElementById(contentWrapperId);
    if (!mainContentDisplayArea) return;

    const copyButtons = mainContentDisplayArea.querySelectorAll('.code-block-copy-button');
    copyButtons.forEach(buttonEl => {
      const newButton = buttonEl.cloneNode(true) as HTMLButtonElement;
      buttonEl.parentNode?.replaceChild(newButton, buttonEl);
      newButton.addEventListener('click', async () => {
        const targetId = newButton.dataset.targetId;
        if (!targetId) return;
        const preElement = mainContentDisplayArea.querySelector(`#${targetId}`);
        if (preElement && preElement.textContent) {
          try {
            await navigator.clipboard.writeText(preElement.textContent);
            newButton.innerHTML = newButton.dataset.checkIcon || CheckSvgIcon;
            newButton.classList.add('text-green-500');
            toast({ title: "Code Copied!", description: "The code block has been copied."});
            setTimeout(() => {
              newButton.innerHTML = newButton.dataset.copyIcon || ClipboardCopySvgIcon;
              newButton.classList.remove('text-green-500');
            }, 2000);
          } catch (err) {
            console.error("Failed to copy code: ", err);
            toast({ title: "Error Copying Code", variant: "destructive"});
          }
        }
      });
    });
  }, [data, isFullScreen, mounted, toast, contentWrapperId, viewMode]);


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
        toast({ title: "Copied to clipboard!", description: "Full README content copied."});
        setTimeout(() => setIsCopiedGlobal(false), 2000);
      })
      .catch(err => {
        console.error("Failed to copy: ", err);
        toast({ title: "Error copying", variant: "destructive"});
      });
  };

  const handleLogoUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomLogoDataUri(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else if (file) {
      toast({ title: "Invalid File", description: "Please upload an image file.", variant: "destructive" });
    }
  };

  const readmeToBrandedHtml = (
    readmeData: FullReadmeData,
    logoUri: string | null,
    themeColorHex: string
  ): string => {
    const escapeHtml = (unsafe: string | undefined): string => {
      if (!unsafe) return '';
      return unsafe
           .replace(/&/g, "&amp;")
           .replace(/</g, "&lt;")
           .replace(/>/g, "&gt;")
           .replace(/"/g, "&quot;")
           .replace(/'/g, "&#039;");
    };

    const markdownToBasicHtml = (md: string | undefined) => {
        if (!md) return '';
        let html = escapeHtml(md);
        // Basic list conversion
        html = html.replace(/^- (.*)/gm, '<li>$1</li>');
        html = html.replace(/<\/li>\n<li>/gm, '</li><li>'); // Fix multiple newlines between list items
        html = html.replace(/<ul>\s*<li>/gm, '<ul><li>'); // Fix space after <ul>
        html = html.replace(/^(<li>.*<\/li>)$/gm, '<ul>$1</ul>'); // Wrap single line lists
        html = html.replace(/<\/li>\n<\/ul>/gm, '</li></ul>'); // Fix newline before </ul>
        // Convert multiple <ul> to one
        html = html.replace(/<\/ul>\s*<ul>/gm, '');


        // Basic headings (simplified)
        html = html.replace(/^### (.*$)/gim, `<h3 style="font-size: 16px; color: ${themeColorHex}; margin-top: 15px; margin-bottom: 5px;">$1</h3>`);
        html = html.replace(/^## (.*$)/gim, `<h2 style="font-size: 18px; color: ${themeColorHex}; margin-top: 20px; margin-bottom: 8px; border-bottom: 1px solid ${themeColorHex}; padding-bottom: 3px;">$1</h2>`);

        // Paragraphs
        html = html.split('\n').map(p => p.trim() ? `<p style="font-size: 13px; line-height: 1.6; color: #555; margin-bottom: 10px;">${p}</p>` : '').join('');
        html = html.replace(/<\/p><p/g, '</p><p'); // Remove extra space if paragraphs are just separated by single newlines
        return html;
    };
    
    let fullHtml = `<div style="font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: auto; border: 1px solid #ddd; color: #333;">`;
    if (logoUri) {
      fullHtml += `<div style="text-align: center; margin-bottom: 25px;"><img src="${logoUri}" alt="Custom Logo" style="max-height: 80px; max-width: 200px; display: inline-block;" /></div>`;
    }
    fullHtml += `<h1 style="font-size: 26px; color: ${themeColorHex}; border-bottom: 2px solid ${themeColorHex}; padding-bottom: 8px; margin-bottom: 20px; text-align: center;">${escapeHtml(readmeData.projectName)}</h1>`;
    
    fullHtml += `<div style="margin-bottom: 20px;"><h2 style="font-size: 20px; color: ${themeColorHex}; margin-bottom: 10px; border-bottom: 1px solid ${themeColorHex}; padding-bottom: 4px;">Project Description</h2>${markdownToBasicHtml(readmeData.projectDescription)}</div>`;
    fullHtml += `<div style="margin-bottom: 20px;"><h2 style="font-size: 20px; color: ${themeColorHex}; margin-bottom: 10px; border-bottom: 1px solid ${themeColorHex}; padding-bottom: 4px;">Features</h2>${markdownToBasicHtml(readmeData.features)}</div>`;
    fullHtml += `<div style="margin-bottom: 20px;"><h2 style="font-size: 20px; color: ${themeColorHex}; margin-bottom: 10px; border-bottom: 1px solid ${themeColorHex}; padding-bottom: 4px;">Technologies Used</h2>${markdownToBasicHtml(readmeData.technologiesUsed)}</div>`;
    
    fullHtml += `<div style="margin-bottom: 20px;"><h2 style="font-size: 20px; color: ${themeColorHex}; margin-bottom: 10px; border-bottom: 1px solid ${themeColorHex}; padding-bottom: 4px;">Folder Structure</h2><pre style="background-color: #f0f0f0; border: 1px solid #ccc; padding: 10px; border-radius: 5px; font-size: 12px; white-space: pre-wrap; word-wrap: break-word; color: #444;">${escapeHtml(readmeData.folderStructure)}</pre></div>`;
    
    fullHtml += `<div style="margin-bottom: 20px;"><h2 style="font-size: 20px; color: ${themeColorHex}; margin-bottom: 10px; border-bottom: 1px solid ${themeColorHex}; padding-bottom: 4px;">Setup Instructions</h2>${markdownToBasicHtml(readmeData.setupInstructions)}</div>`;
    
    fullHtml += `</div>`;
    return fullHtml;
  };

  const handleDownloadBrandedPdf = async () => {
    if (!mounted || !data) return;
    setIsGeneratingBrandedPdf(true);
    toast({ title: "Generating Branded PDF...", description: "This may take a moment." });
    try {
      const brandedHtml = readmeToBrandedHtml(data, customLogoDataUri, selectedThemeColor);
      const pdfContainer = document.createElement('div');
      pdfContainer.style.position = 'absolute'; pdfContainer.style.left = '-9999px'; pdfContainer.style.width = '800px'; // A4-like width
      pdfContainer.innerHTML = brandedHtml;
      document.body.appendChild(pdfContainer);

      const canvas = await html2canvas(pdfContainer, { scale: 2, useCORS: true, logging: false, width: pdfContainer.scrollWidth, height: pdfContainer.scrollHeight, windowWidth: pdfContainer.scrollWidth, windowHeight: pdfContainer.scrollHeight });
      document.body.removeChild(pdfContainer);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'p', unit: 'px', format: [canvas.width, canvas.height] });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      const sanitizedProjectName = data.projectName.replace(/[^a-z0-9_]/gi, '_').toLowerCase();
      pdf.save(`${sanitizedProjectName || 'readme'}_branded.pdf`);
      toast({ title: "Branded PDF Generated!", description: "Your branded PDF has been downloaded." });
    } catch (e: any) {
      console.error("Branded PDF Generation Error:", e);
      toast({ title: "PDF Generation Failed", description: e.message || "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsGeneratingBrandedPdf(false);
      setIsBrandingDialogOpen(false);
    }
  };


  const handleMoreDetailClick = () => { if (!mounted) return; onGenerateDetails(data); };
  const handleEditClick = () => { if (!mounted) return; onEditRequest(); };
  const toggleFullScreen = () => { if (!mounted) return; setIsFullScreen(!isFullScreen); }
  const toggleViewMode = () => { if (!mounted) return; setViewMode(prev => prev === 'formatted' ? 'raw' : 'formatted'); };

  if (!mounted) return null;

  return (
     <>
     <Card className={cn(
        "w-full shadow-xl border hover:border-foreground transition-colors duration-200",
        isFullScreen && "fixed inset-0 z-50 m-0 rounded-none border-none flex flex-col h-screen"
      )}>
      <CardHeader className={cn(
        "flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 sm:pb-2",
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
            "gap-1 sm:gap-2 justify-start",
            "sm:justify-end mt-2 sm:mt-0"
          )}>
           <Button variant="outline" size="sm" onClick={handleEditClick} className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-2 py-1 sm:text-sm sm:px-3 sm:py-1.5">
            <Edit3 className="mr-1 h-3.5 w-3.5 sm:h-4 sm:w-4" /> Edit
          </Button>
          <Button variant="outline" size="sm" onClick={handleMoreDetailClick} disabled={isGeneratingDetails} className="bg-secondary text-secondary-foreground hover:bg-secondary/80 text-xs px-2 py-1 sm:text-sm sm:px-3 sm:py-1.5">
            {isGeneratingDetails ? <Loader2 className="mr-1 h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" /> : <span dangerouslySetInnerHTML={{ __html: FileTextIconSvg }} className="mr-1 h-3.5 w-3.5 sm:h-4 sm:w-4 [&_svg]:h-full [&_svg]:w-full"></span>}
            {isGeneratingDetails ? "Generating..." : "More Detail"}
          </Button>
           <Button variant="outline" size="sm" onClick={toggleViewMode} className="bg-purple-500 hover:bg-purple-600 text-white text-xs px-2 py-1 sm:text-sm sm:px-3 sm:py-1.5">
            {viewMode === 'formatted' ? <CodeIcon className="mr-1 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4" /> : <EyeIcon className="mr-1 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4" />}
            {viewMode === 'formatted' ? 'View Raw' : 'View Formatted'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleGlobalCopy} className="bg-accent text-accent-foreground hover:bg-accent/90 text-xs px-2 py-1 sm:text-sm sm:px-3 sm:py-1.5">
            {isCopiedGlobal ? <Check className="mr-1 h-3.5 w-3.5 sm:h-4 sm:w-4" /> : <span dangerouslySetInnerHTML={{ __html: ClipboardCopySvgIcon }} className="mr-1 h-3.5 w-3.5 sm:h-4 sm:w-4 [&_svg]:h-full [&_svg]:w-full"></span>}
            {isCopiedGlobal ? "Copied!" : "Copy All"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsBrandingDialogOpen(true)} className="bg-orange-500 hover:bg-orange-600 text-white text-xs px-2 py-1 sm:text-sm sm:px-3 sm:py-1.5">
            <Palette className="mr-1 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4" />
            Branding
          </Button>
          <Button variant="outline" size="sm" onClick={toggleFullScreen} className="bg-muted text-muted-foreground hover:bg-muted/80 text-xs px-2 py-1 sm:text-sm sm:px-3 sm:py-1.5">
            {isFullScreen ? <Minimize className="mr-1 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4" /> : <Maximize className="mr-1 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4" />}
            {isFullScreen ? "Exit Full" : "Full Screen"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className={cn(
         "p-0",
         isFullScreen && "flex-1 flex flex-col min-h-0"
        )}>
        <ScrollArea
          ref={scrollAreaRef}
          className={cn(
            "w-full bg-background",
            isFullScreen ? "flex-1 h-auto w-full border-0 rounded-none bg-transparent" : "h-[calc(100vh-420px)] min-h-[300px] sm:h-[calc(100vh-380px)] md:h-[500px] rounded-b-lg"
          )}
        >
        {viewMode === 'formatted' ? (
          <div className={cn(
              "space-y-3 sm:space-y-4",
              isFullScreen ? "max-w-4xl mx-auto px-3 py-3 sm:px-6 sm:py-4" : "p-3 sm:p-4"
            )}>
            {!isFullScreen && (
              <div className="py-1.5 sm:py-2 border-b border-border/50">
                <h1 className="text-xl sm:text-2xl font-bold text-primary underline decoration-primary/60 underline-offset-4 sm:underline-offset-[6px] mb-1.5 sm:mb-2 font-headline">
                  {data.projectName}
                </h1>
              </div>
            )}
            <MarkdownContent contentWrapperId={contentWrapperId + "-desc"} content={data.projectDescription} isFullScreen={isFullScreen} />
            <MarkdownContent contentWrapperId={contentWrapperId + "-feat"} content={data.features} isFullScreen={isFullScreen} />
            <MarkdownContent contentWrapperId={contentWrapperId + "-tech"} content={data.technologiesUsed} isFullScreen={isFullScreen} />
            <MarkdownContent contentWrapperId={contentWrapperId + "-fold"} content={data.folderStructure} isFullScreen={isFullScreen} />
            <MarkdownContent contentWrapperId={contentWrapperId + "-set"} content={data.setupInstructions} isFullScreen={isFullScreen}/>
          </div>
           ) : (
            <pre
              className={cn(
                "font-mono text-xs sm:text-sm whitespace-pre-wrap break-all bg-popover text-popover-foreground rounded-md",
                isFullScreen ? "max-w-4xl mx-auto p-3 py-3 sm:p-6 sm:py-4 h-full" : "p-3 sm:p-4 m-3 sm:m-4"
              )}
            >
              {formatReadmeForCopy(data)}
            </pre>
          )}
        </ScrollArea>
      </CardContent>
    </Card>

    <Dialog open={isBrandingDialogOpen} onOpenChange={setIsBrandingDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-orange-500" /> Custom Branding & Export
            </DialogTitle>
            <DialogDescription>
              Upload a logo and choose a theme color for branded PDF exports.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-3">
            <div className="space-y-2">
              <Label htmlFor="logo-upload" className="flex items-center gap-1.5 text-sm font-medium">
                <ImageUp className="h-4 w-4" /> Upload Your Logo
              </Label>
              <Input id="logo-upload" type="file" accept="image/*" onChange={handleLogoUpload} className="text-xs file:text-xs" disabled={isGeneratingBrandedPdf}/>
              {customLogoDataUri && (
                <div className="mt-3 p-2 border rounded-md bg-muted/50 inline-flex flex-col items-center gap-2">
                  <img src={customLogoDataUri} alt="Logo Preview" className="max-h-20 max-w-[200px] object-contain rounded" />
                  <Button variant="ghost" size="sm" onClick={() => setCustomLogoDataUri(null)} className="text-xs text-destructive hover:text-destructive/80" disabled={isGeneratingBrandedPdf}>
                    <CircleX className="mr-1 h-3.5 w-3.5" /> Remove Logo
                  </Button>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="theme-color-picker" className="text-sm font-medium">Select Primary Theme Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="theme-color-picker"
                  type="color"
                  value={selectedThemeColor}
                  onChange={(e) => setSelectedThemeColor(e.target.value)}
                  className="h-10 w-16 p-1 cursor-pointer"
                  disabled={isGeneratingBrandedPdf}
                />
                <Input
                    type="text"
                    value={selectedThemeColor}
                    onChange={(e) => setSelectedThemeColor(e.target.value)}
                    placeholder="#4285F4"
                    className="h-10 flex-1 text-sm"
                    disabled={isGeneratingBrandedPdf}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center pt-2">
                Your logo and theme color will be applied to the "Download Branded PDF" option.
            </p>
          </div>
          <DialogFooter className="sm:justify-end gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isGeneratingBrandedPdf}>Close</Button>
            </DialogClose>
            <Button type="button" onClick={handleDownloadBrandedPdf} disabled={isGeneratingBrandedPdf || !data}>
              {isGeneratingBrandedPdf ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <DownloadCloud className="mr-2 h-4 w-4" /> }
              Download Branded PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
