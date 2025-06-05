
// src/app/past-files/page.tsx
"use client";

import type { ChangeEvent } from "react";
import { useState, useEffect, useRef, FormEvent, ChangeEvent as ReactTextareaChangeEvent } from "react";
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, AlertTriangle, UploadCloud, Download, Trash2, Home, LogIn, UserPlus, LogOut, LayoutDashboard, Eye, Save, XCircle, Check, MessagesSquare, ClipboardPaste, Github } from "lucide-react";
import { processGitHubRepo, generateDetailedReadme, type FullReadmeData } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/theme-toggle";
import { isLoggedIn, setLoggedIn as setAuthLoggedIn, getCurrentUserEmail } from '@/lib/auth/storage';
import { useRouter } from 'next/navigation';
import React from 'react';
import { cn } from "@/lib/utils";
import { ReadmeDisplay } from "@/components/readme-display";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';


const ClipboardCopySvgIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"></rect><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path></svg>`;
const CheckSvgIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
const FileTextIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>`;


interface FileDetail {
  id: string;
  name: string;
  size: number;
  type: string;
  content: string;
}

interface GeneratedReadmeForFile {
  fileId: string;
  fileName: string;
  readmeData: FullReadmeData | null;
  error?: string | null;
  isLoading: boolean;
  contentWrapperId: string;
}

interface SavedReadmeItem extends FullReadmeData {
  id: string;
  savedDate: string;
  inputTypeUsed?: string; // Keep this generic for items saved elsewhere
  originalInput?: string;
}

const readmeToSimplifiedHtml = (readme: SavedReadmeItem): string => {
  let html = `<div style="font-family: Arial, sans-serif; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid #eee; page-break-inside: avoid;">`;
  html += `<h1 style="font-size: 20px; color: #2c3e50; margin-bottom: 10px; border-bottom: 2px solid #3498db; padding-bottom: 5px;">${readme.projectName || 'Untitled Project'}</h1>`;
  const formatSection = (title: string, content: string | undefined, isPreformatted = false) => {
    if (!content || content.trim() === "" || content.trim().toLowerCase() === "not applicable" || content.trim().toLowerCase() === "n/a") {
      return `<p style="font-size: 13px; color: #7f8c8d; font-style: italic;">${title}: Not available</p>`;
    }
    let sectionHtml = `<div style="margin-top: 12px;">`;
    sectionHtml += `<h2 style="font-size: 16px; color: #34495e; margin-bottom: 6px;">${title}</h2>`;
    if (isPreformatted) {
      sectionHtml += `<pre style="background-color: #f9f9f9; border: 1px solid #ecf0f1; padding: 8px; border-radius: 4px; font-size: 12px; white-space: pre-wrap; word-wrap: break-word; color: #555;">${content.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>`;
    } else {
      const lines = content.split('\n');
      let listOpen = false;
      const processedContent = lines.map(line => {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
          if (!listOpen) { listOpen = true; return `<ul><li style="font-size: 13px; line-height: 1.5; color: #555; margin-bottom: 4px;">${trimmedLine.substring(2).replace(/</g, "&lt;").replace(/>/g, "&gt;")}</li>`; }
          return `<li style="font-size: 13px; line-height: 1.5; color: #555; margin-bottom: 4px;">${trimmedLine.substring(2).replace(/</g, "&lt;").replace(/>/g, "&gt;")}</li>`;
        } else {
          if (listOpen) { listOpen = false; return `</ul><p style="font-size: 13px; line-height: 1.5; color: #555; margin-bottom: 4px;">${line.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>`; }
          return `<p style="font-size: 13px; line-height: 1.5; color: #555; margin-bottom: 4px;">${line.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>`;
        }
      }).join('');
      sectionHtml += listOpen ? processedContent + '</ul>' : processedContent;
    }
    sectionHtml += `</div>`;
    return sectionHtml;
  };
  html += formatSection("Project Description", readme.projectDescription);
  html += formatSection("Features", readme.features);
  html += formatSection("Technologies Used", readme.technologiesUsed);
  html += formatSection("Folder Structure", readme.folderStructure, true);
  html += formatSection("Setup Instructions", readme.setupInstructions);
  html += `</div>`;
  return html;
};


const MarkdownContentDisplay: React.FC<{ content: string; title: string; isFullScreen?: boolean; contentWrapperId: string; }> = ({ content, title, isFullScreen, contentWrapperId }) => {
  if (!content && content !== "") return <p className="text-muted-foreground italic text-xs sm:text-sm">Not available or empty.</p>;
  
  let htmlContent = content
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/^### (.*$)/gim, `<h4 class="text-xs sm:text-sm font-semibold mt-1.5 sm:mt-2 mb-0.5 ${isFullScreen ? 'text-foreground/80' : 'text-primary/80'}">${'$1'}</h4>`)
    .replace(/^## (.*$)/gim, `<h3 class="text-sm sm:text-base font-semibold mt-2 sm:mt-2.5 mb-1 ${isFullScreen ? 'text-foreground/90' : 'text-primary/90'} underline underline-offset-2 decoration-primary/40">${'$1'}</h3>`)
    .replace(/^# (.*$)/gim, `<h2 class="text-base sm:text-lg font-bold mt-2.5 sm:mt-3 mb-1.5 ${isFullScreen ? 'text-foreground' : 'text-primary'} underline underline-offset-2 sm:underline-offset-4 decoration-primary/50">${'$1'}</h2>`)
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/<u>(.*?)<\/u>/g, '<u>$1</u>')
    .replace(/`([^`]+)`/g, (match, p1) => `<code class="bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-300 px-1.5 py-0.5 rounded text-xs sm:text-sm font-mono shadow-sm border border-border/30">${p1}</code>`)
    .replace(/^(?:(?:- |\* |\+ )\s*.*(?:\n|$))+/gm, (match) => {
      const items = match.trim().split('\n').map(item => `<li class="ml-4 sm:ml-5 list-disc space-y-0.5 my-0.5 sm:my-1 text-xs sm:text-sm ${isFullScreen ? 'text-foreground/90' : 'text-foreground/80 dark:text-foreground/70'}">${item.replace(/^(- |\* |\+ )\s*/, '')}</li>`).join('');
      return `<ul class="space-y-0.5 mb-1 sm:mb-1.5">${items}</ul>`;
    })
    .replace(/^(?:\d+\.\s*.*(?:\n|$))+/gm, (match) => {
        const items = match.trim().split('\n').map(item => `<li class="ml-4 sm:ml-5 list-decimal space-y-0.5 my-0.5 sm:my-1 text-xs sm:text-sm ${isFullScreen ? 'text-foreground/90' : 'text-foreground/80 dark:text-foreground/70'}">${item.replace(/^\d+\.\s*/, '')}</li>`).join('');
        return `<ol class="space-y-0.5 mb-1 sm:mb-1.5">${items}</ol>`;
    })
   .replace(/```([\s\S]*?)```/g, (match, p1, offset) => {
      const uniqueId = `codeblock-file-${contentWrapperId}-${offset}-${Math.random().toString(36).substring(2,9)}`;
      return `
        <div class="code-block-container group relative my-1.5 rounded-lg shadow-md overflow-hidden bg-neutral-800 dark:bg-black sm:my-2">
          <button 
            class="code-block-copy-button absolute top-1 right-1 z-10 p-1 rounded-md text-neutral-400 hover:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-sky-500 opacity-60 group-hover:opacity-100 transition-opacity duration-150" 
            data-target-id="${uniqueId}"
            data-copy-icon='${ClipboardCopySvgIcon.replace(/'/g, "&apos;")}'
            data-check-icon='${CheckSvgIcon.replace(/'/g, "&apos;")}'
            aria-label="Copy code to clipboard"
          >
            ${ClipboardCopySvgIcon}
          </button>
          <pre id="${uniqueId}" class="text-neutral-200 dark:text-neutral-100 p-2 pt-7 sm:p-3 sm:pt-8 text-xs overflow-x-auto font-mono">${p1.trim()}</pre>
        </div>
      `;
    })
    .replace(/\n/g, '<br />');

  htmlContent = htmlContent.split('<br />').map(line => {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith('<h') || trimmedLine.startsWith('<ul') || trimmedLine.startsWith('<ol') || trimmedLine.startsWith('<div class="code-block-container') || trimmedLine.startsWith('<li') || trimmedLine === '') {
      return line;
    }
    return `<p class="mb-1 sm:mb-1.5 leading-relaxed text-xs sm:text-sm ${isFullScreen ? 'text-foreground/90' : 'text-foreground/80 dark:text-foreground/70'}">${line || <>&nbsp;</>}</p>`;
  }).join('<br />').replace(/<br \/>(<p|<div class="code-block-container)/g, '$1').replace(/(<\/p>|<\/div>)<br \/>/g, '$1');


  return (
    <div className="prose prose-xs sm:prose-sm dark:prose-invert max-w-none">
      <h4 className="text-xs sm:text-sm font-semibold mb-1 pb-1 border-b border-border/70 text-primary/90">{title}:</h4>
      <div dangerouslySetInnerHTML={{ __html: htmlContent || '' }} />
    </div>
  );
};


export default function PastFilesPage() {
  const [selectedFileDetails, setSelectedFileDetails] = useState<FileDetail[]>([]);
  const [generatedFileReadmes, setGeneratedFileReadmes] = useState<GeneratedReadmeForFile[]>([]);
  const [isOverallLoading, setIsOverallLoading] = useState<boolean>(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const [loggedIn, setLoggedInStatus] = useState(false);
  
  // State for Saved READMEs functionality
  const [savedReadmesList, setSavedReadmesList] = useState<SavedReadmeItem[]>([]);
  const [selectedSavedReadmeForDisplay, setSelectedSavedReadmeForDisplay] = useState<FullReadmeData | null>(null);
  const [currentSavedReadmeIdForDisplay, setCurrentSavedReadmeIdForDisplay] = useState<string | null>(null);
  const [isEditingSavedReadme, setIsEditingSavedReadme] = useState<boolean>(false);
  const [editableSavedReadmeData, setEditableSavedReadmeData] = useState<FullReadmeData | null>(null);
  const [isGeneratingDetailsForSaved, setIsGeneratingDetailsForSaved] = useState<boolean>(false);
  const [selectedSavedReadmeIdsForPdf, setSelectedSavedReadmeIdsForPdf] = useState<string[]>([]);
  const [isGeneratingSavedPdf, setIsGeneratingSavedPdf] = useState<boolean>(false);


  useEffect(() => {
    setMounted(true);
    const checkLoginStatus = () => {
      const isLoggedInNow = isLoggedIn();
      setLoggedInStatus(isLoggedInNow);
      if (isLoggedInNow) {
        const userEmail = getCurrentUserEmail();
        if (userEmail) {
          const userSavedReadmesKey = `savedReadmes_${userEmail}`;
          const storedReadmes = localStorage.getItem(userSavedReadmesKey);
          if (storedReadmes) {
            try { setSavedReadmesList(JSON.parse(storedReadmes)); }
            catch (e) { console.error("Failed to parse saved READMEs", e); localStorage.removeItem(userSavedReadmesKey); setSavedReadmesList([]);}
          } else { setSavedReadmesList([]);}
        } else { setSavedReadmesList([]);}
      } else { setSavedReadmesList([]);}
    };
    checkLoginStatus(); 
    window.addEventListener('storage', checkLoginStatus); 
    return () => {
      window.removeEventListener('storage', checkLoginStatus);
    };
  }, []);
  
  useEffect(() => {
    if (mounted && loggedIn) {
        const userEmail = getCurrentUserEmail();
        if (userEmail) {
            const userSavedReadmesKey = `savedReadmes_${userEmail}`;
            if (savedReadmesList.length > 0 || localStorage.getItem(userSavedReadmesKey)) {
                 localStorage.setItem(userSavedReadmesKey, JSON.stringify(savedReadmesList));
            }
        }
    }
  }, [savedReadmesList, mounted, loggedIn]);


  useEffect(() => {
    if (!mounted || generatedFileReadmes.length === 0) return;

    generatedFileReadmes.forEach(genFile => {
        if (genFile.readmeData && !genFile.isLoading) {
            const contentWrapperElement = document.getElementById(genFile.contentWrapperId);
            if (!contentWrapperElement) return;

            const copyButtons = contentWrapperElement.querySelectorAll('.code-block-copy-button');
            copyButtons.forEach(buttonEl => {
                const newButton = buttonEl.cloneNode(true) as HTMLButtonElement;
                buttonEl.parentNode?.replaceChild(newButton, buttonEl);

                newButton.addEventListener('click', async () => {
                    const targetId = newButton.dataset.targetId;
                    if (!targetId) return;
                    const preElement = contentWrapperElement.querySelector(`#${targetId}`); 
                    if (preElement && preElement.textContent) {
                        try {
                            await navigator.clipboard.writeText(preElement.textContent);
                            newButton.innerHTML = newButton.dataset.checkIcon || CheckSvgIcon;
                            newButton.classList.add('text-green-500');
                            toast({ title: "Code Copied!", description: `Code from ${genFile.fileName} copied.` });
                            setTimeout(() => {
                                newButton.innerHTML = newButton.dataset.copyIcon || ClipboardCopySvgIcon;
                                newButton.classList.remove('text-green-500');
                            }, 2000);
                        } catch (err) {
                            console.error("Failed to copy code: ", err);
                            toast({ title: "Error Copying Code", variant: "destructive" });
                        }
                    }
                });
            });
        }
    });

  }, [generatedFileReadmes, mounted, toast]);


  const handleLogout = () => {
    setAuthLoggedIn(false);
    setLoggedInStatus(false); 
    toast({ title: "Logged Out", description: "You have been successfully logged out." });
    router.push('/'); 
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!mounted) return;
    const files = event.target.files;
    if (!files || files.length === 0) {
      return;
    }

    setGlobalError(null);
    const newFileDetails: FileDetail[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const content = await readFileAsText(file);
        newFileDetails.push({
          id: `${file.name}-${file.lastModified}-${file.size}-${Math.random().toString(36).substring(2,9)}`,
          name: file.name,
          size: file.size,
          type: file.type || "unknown",
          content: content,
        });
      } catch (e) {
        console.error("Error reading file:", file.name, e);
        setGlobalError(`Error reading file ${file.name}. It might be too large or not a text file.`);
        toast({ title: `Error Reading File: ${file.name}`, description: "The file might be too large or not a text file.", variant: "destructive"});
        return; 
      }
    }
    setSelectedFileDetails(prevDetails => [...prevDetails, ...newFileDetails].filter((v,i,a)=>a.findIndex(t=>(t.id === v.id))===i));

    if (event.target) {
      event.target.value = "";
    }
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  };

  const handleRemoveFile = (fileIdToRemove: string) => {
    setSelectedFileDetails(prevDetails => prevDetails.filter(file => file.id !== fileIdToRemove));
    setGeneratedFileReadmes(prevGenerated => prevGenerated.filter(gen => gen.fileId !== fileIdToRemove));
    if (selectedFileDetails.length === 1 && generatedFileReadmes.every(g => g.fileId !== fileIdToRemove)) {
        setGlobalError(null);
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

  const handleSaveGeneratedFileReadme = (readmeToSave: FullReadmeData, originalFileName: string) => {
    if (!mounted || !isLoggedIn() || !getCurrentUserEmail()) return;
    const newReadme: SavedReadmeItem = {
      ...readmeToSave,
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      savedDate: new Date().toISOString(),
      inputTypeUsed: "file-upload", // Specific type for this page
      originalInput: originalFileName,
    };
    setSavedReadmesList((prev) => {
      const updatedReadmes = [newReadme, ...prev.slice(0, 19)]; 
      return updatedReadmes;
    });
    toast({
      title: "README Automatically Saved!",
      description: `${newReadme.projectName} (from ${originalFileName}) has been added to your saved list.`,
    });
  };

  const handleGenerateAllReadmes = async () => {
    if (!mounted) return;

    if (!loggedIn) {
      toast({ title: "Authentication Required", description: "Please log in to generate READMEs.", variant: "destructive",});
      router.push('/auth/login');
      return;
    }
    
    if (selectedFileDetails.length === 0) {
      setGlobalError("Please upload at least one file.");
      toast({ title: "No Files", description: "Please upload at least one file.", variant: "destructive" });
      return;
    }
    setGlobalError(null);
    setIsOverallLoading(true);
    setSelectedSavedReadmeForDisplay(null); // Clear any viewed saved README

    const initialReadmeStates = selectedFileDetails.map(file => ({
      fileId: file.id,
      fileName: file.name,
      readmeData: null,
      error: null,
      isLoading: true,
      contentWrapperId: `file-readme-content-${file.id}`
    }));
    setGeneratedFileReadmes(initialReadmeStates); 

    for (const fileDetail of selectedFileDetails) {
      try {
        const result = await processGitHubRepo({ codeContent: fileDetail.content });

        if (result && "error" in result) {
          setGeneratedFileReadmes(prev => prev.map(item => item.fileId === fileDetail.id ? { ...item, error: result.error, readmeData: null, isLoading: false } : item));
          toast({ title: `Generation Failed: ${fileDetail.name}`, description: result.error, variant: "destructive", duration: 5000 });
        } else if (result) {
          setGeneratedFileReadmes(prev => prev.map(item => item.fileId === fileDetail.id ? { ...item, readmeData: result, error: null, isLoading: false } : item));
          handleSaveGeneratedFileReadme(result, fileDetail.name); // Save the generated README
          toast({ title: `README Generated & Saved: ${fileDetail.name}`, duration: 3000 });
        } else {
           setGeneratedFileReadmes(prev => prev.map(item => item.fileId === fileDetail.id ? { ...item, error: "An unknown error occurred.", readmeData: null, isLoading: false } : item));
           toast({ title: `Generation Failed: ${fileDetail.name}`, description: "An unknown error occurred.", variant: "destructive", duration: 5000 });
        }
      } catch (e: any) {
         setGeneratedFileReadmes(prev => prev.map(item => item.fileId === fileDetail.id ? { ...item, error: e.message || `Unexpected error for ${fileDetail.name}.`, readmeData: null, isLoading: false } : item));
         toast({ title: `Processing Error: ${fileDetail.name}`, description: e.message || "An unexpected error occurred.", variant: "destructive", duration: 5000 });
      }
    }
    setIsOverallLoading(false);
  };

  const formatReadmeForTxt = (readmeData: FullReadmeData): string => {
    const cleanText = (text: string) => {
        if (!text) return "N/A";
        return text.replace(/^#+\s*/gm, '').replace(/^- /gm, '* ').replace(/```[\s\S]*?```/g, '(Code Block)').replace(/`([^`]+)`/g, '$1'); 
    };
    return `Project Name: ${cleanText(readmeData.projectName)}\n\n--------------------\nProject Description:\n--------------------\n${cleanText(readmeData.projectDescription)}\n\n--------------------\nFeatures:\n--------------------\n${cleanText(readmeData.features)}\n\n--------------------\nTechnologies Used:\n--------------------\n${cleanText(readmeData.technologiesUsed)}\n\n--------------------\nFolder Structure:\n--------------------\n${cleanText(readmeData.folderStructure)}\n(Note: For complex structures, refer to original code or use Markdown viewer.)\n\n--------------------\nSetup Instructions:\n--------------------\n${cleanText(readmeData.setupInstructions)}`.trim().replace(/\n\n\n+/g, '\n\n'); 
  };

  const handleDownloadIndividualReadme = (readmeData: FullReadmeData, originalFileName: string) => {
    if (!mounted || !readmeData) return;
    const readmeText = formatReadmeForTxt(readmeData);
    const blob = new Blob([readmeText], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    const baseName = originalFileName.substring(0, originalFileName.lastIndexOf('.')) || originalFileName;
    const sanitizedBaseName = baseName.replace(/[^a-z0-9_.]/gi, '_').toLowerCase(); 
    link.download = `${sanitizedBaseName || 'readme'}_readme.txt`;
    document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(link.href);
    toast({ title: "README Downloading...", description: `${link.download} will be downloaded.`});
  };

  // Functions for Saved READMEs section
  const handleDeleteSavedReadme = (id: string) => {
    if (!mounted || !loggedIn) return;
    setSavedReadmesList((prev) => prev.filter((item) => item.id !== id));
    setSelectedSavedReadmeIdsForPdf(prev => prev.filter(selectedId => selectedId !== id));
    if (selectedSavedReadmeForDisplay && currentSavedReadmeIdForDisplay === id) {
        setSelectedSavedReadmeForDisplay(null); 
        setCurrentSavedReadmeIdForDisplay(null);
        setIsEditingSavedReadme(false);
        setEditableSavedReadmeData(null);
    }
    toast({ title: "Saved README Deleted", variant: "destructive" });
  };

  const handleLoadSavedReadme = (readmeItem: SavedReadmeItem) => {
    if (!mounted || !loggedIn) return;
    setSelectedSavedReadmeForDisplay(readmeItem);
    setCurrentSavedReadmeIdForDisplay(readmeItem.id); 
    setIsEditingSavedReadme(false); 
    setEditableSavedReadmeData(null);
    toast({ title: "Saved README Loaded", description: `${readmeItem.projectName} is now displayed.` });
    // Scroll to the display area
    const displayElement = document.getElementById("saved-readme-display-area");
    if (displayElement) displayElement.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  
  const handleDownloadSavedReadmeMd = (readmeItem: FullReadmeData) => {
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
\`\`\`
${readmeItem.folderStructure}
\`\`\`
## Setup Instructions
${readmeItem.setupInstructions}
    `.trim();
    const blob = new Blob([readmeText], { type: 'text/markdown;charset=utf-utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    const sanitizedProjectName = readmeItem.projectName.replace(/[^a-z0-9_]/gi, '_').toLowerCase();
    link.download = `${sanitizedProjectName || 'readme'}.md`;
    document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(link.href);
    toast({ title: "README.md Downloading...", description: `${link.download} will be downloaded.`});
  };
  
  const handleEditRequestForSavedItem = () => {
    if (selectedSavedReadmeForDisplay) {
      setEditableSavedReadmeData({ ...selectedSavedReadmeForDisplay });
      setIsEditingSavedReadme(true);
    }
  };

  const handleEditableSavedInputChange = (e: ReactTextareaChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: keyof FullReadmeData) => {
    if (editableSavedReadmeData) {
      setEditableSavedReadmeData({ ...editableSavedReadmeData, [field]: e.target.value });
    }
  };

  const handleSaveChangesForSavedItem = () => {
    if (editableSavedReadmeData && currentSavedReadmeIdForDisplay) {
      setSelectedSavedReadmeForDisplay(editableSavedReadmeData);
      setSavedReadmesList(prev => prev.map(item =>
        item.id === currentSavedReadmeIdForDisplay
          ? { ...item, ...editableSavedReadmeData, savedDate: new Date().toISOString() }
          : item
      ));
      toast({ title: "Edits Saved!", description: "Changes to the saved README have been updated." });
      setIsEditingSavedReadme(false);
      setEditableSavedReadmeData(null);
    }
  };

  const handleCancelEditsForSavedItem = () => {
    setIsEditingSavedReadme(false);
    setEditableSavedReadmeData(null);
    toast({ title: "Edits Cancelled", variant: "default" });
  };

  const handleGenerateDetailsForSavedItem = async (currentData: FullReadmeData) => {
    if (!mounted || !loggedIn || !currentData || !currentSavedReadmeIdForDisplay) return;
    if (isEditingSavedReadme) {
      toast({ title: "Save or Cancel Edits", description: "Please save or cancel current edits before generating details.", variant: "destructive"});
      return;
    }
    setIsGeneratingDetailsForSaved(true);
    const result = await generateDetailedReadme(currentData);
    if (result && "error" in result) {
      toast({ title: "Detail Generation Failed", description: result.error, variant: "destructive" });
    } else if (result) {
      setSelectedSavedReadmeForDisplay(result);
      setSavedReadmesList(prev => prev.map(item =>
        item.id === currentSavedReadmeIdForDisplay
          ? { ...item, ...result, savedDate: new Date().toISOString() }
          : item
      ));
      toast({ title: "Saved README Enhanced & Updated!", description: "The detailed README has been updated." });
    } else {
      toast({ title: "Detail Generation Failed", description: "An unknown error occurred.", variant: "destructive" });
    }
    setIsGeneratingDetailsForSaved(false);
  };

  const handleSavedPdfSelectionChange = (readmeId: string, checked: boolean | "indeterminate") => {
    if (checked === true) { setSelectedSavedReadmeIdsForPdf(prev => [...prev, readmeId]); }
    else { setSelectedSavedReadmeIdsForPdf(prev => prev.filter(id => id !== readmeId)); }
  };

  const generateAndDownloadSavedPdf = async (readmesToProcess: SavedReadmeItem[], fileName: string) => {
    if (!mounted || readmesToProcess.length === 0) {
      toast({ title: "No READMEs to Export", description: "Please select at least one saved README.", variant: "destructive" });
      return;
    }
    setIsGeneratingSavedPdf(true);
    toast({ title: "Generating PDF...", description: "This may take a moment." });
    try {
      const combinedHtml = readmesToProcess.map(readme => readmeToSimplifiedHtml(readme)).join('');
      const pdfContainer = document.createElement('div');
      pdfContainer.style.position = 'absolute'; pdfContainer.style.left = '-9999px'; pdfContainer.style.width = '800px';
      pdfContainer.innerHTML = combinedHtml; document.body.appendChild(pdfContainer);
      const canvas = await html2canvas(pdfContainer, { scale: 2, useCORS: true, logging: false, width: pdfContainer.scrollWidth, height: pdfContainer.scrollHeight, windowWidth: pdfContainer.scrollWidth, windowHeight: pdfContainer.scrollHeight });
      document.body.removeChild(pdfContainer);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'p', unit: 'px', format: [canvas.width, canvas.height] });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`${fileName}.pdf`);
      toast({ title: "PDF Generated!", description: `${fileName}.pdf has been downloaded.` });
    } catch (e: any) {
      console.error("PDF Generation Error:", e);
      toast({ title: "PDF Generation Failed", description: e.message || "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsGeneratingSavedPdf(false);
    }
  };

  const handleDownloadAllSavedAsPdf = () => { generateAndDownloadSavedPdf(savedReadmesList, "all_saved_readmes_merged"); };
  const handleDownloadSelectedSavedAsPdf = () => {
    const selectedReadmes = savedReadmesList.filter(readme => selectedSavedReadmeIdsForPdf.includes(readme.id));
    if (selectedReadmes.length === 0) { toast({ title: "No READMEs Selected", description: "Please select saved READMEs to download.", variant: "destructive"}); return; }
    generateAndDownloadSavedPdf(selectedReadmes, "selected_saved_readmes_merged");
  };


  if (!mounted) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-start p-4 sm:p-6 md:p-12 bg-background">
        <div className="w-full max-w-4xl mx-auto text-center">
          <Loader2 className="mx-auto h-10 sm:h-12 w-10 sm:h-12 animate-spin text-primary" />
          <p className="mt-3 sm:mt-4 text-md sm:text-lg text-muted-foreground">Loading Past Files Section...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-4 sm:p-6 md:p-12 lg:p-24 bg-background">
      <div className="container mx-auto flex flex-col items-center gap-6 sm:gap-8 w-full max-w-4xl">
        
        <header className="w-full mb-1 sm:mb-2">
          <nav className="flex justify-between items-center w-full py-2 sm:py-3 border-b mb-3 sm:mb-4">
             <Link href="/" passHref> <Logo /> </Link>
            <div className="flex items-center space-x-1 sm:space-x-2">
              {loggedIn ? (
                <>
                  <Link href="/dashboard" passHref>
                    <Button variant="outline" size="sm" className="px-2 text-xs sm:px-3 sm:text-sm">
                      <LayoutDashboard className="mr-1 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4" /> 
                      <span className="hidden sm:inline">Dashboard</span>
                    </Button>
                  </Link>
                  <Button variant="destructive" size="sm" onClick={handleLogout} className="px-2 text-xs sm:px-3 sm:text-sm">
                    <LogOut className="mr-1 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4" /> 
                    <span className="hidden sm:inline">Logout</span>
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" passHref>
                    <Button variant="outline" size="sm" className="px-2 text-xs sm:px-3 sm:text-sm">
                      <LogIn className="mr-1 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4" /> 
                      <span className="hidden sm:inline">Login</span>
                    </Button>
                  </Link>
                  <Link href="/auth/signup" passHref>
                    <Button variant="default" size="sm" className="px-2 text-xs sm:px-3 sm:text-sm">
                      <UserPlus className="mr-1 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4" /> 
                      <span className="hidden sm:inline">Sign Up</span>
                    </Button>
                  </Link>
                </>
              )}
              <ThemeToggle />
            </div>
          </nav>
          
          <div className="text-center">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary font-headline">Past Files Inventory &amp; README Generator</h1>
            <p className="mt-1 sm:mt-1.5 text-xs sm:text-sm md:text-base text-muted-foreground">
              Upload project files to generate individual READMEs for each. Login required.
            </p>
          </div>
        </header>

        <Card className="w-full shadow-xl border hover:border-foreground transition-colors duration-200">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold flex items-center gap-2">
              <UploadCloud className="h-5 sm:h-6 w-5 sm:h-6 text-primary" /> Upload Files
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Select one or more files. A separate README will be generated and saved for each file.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <div>
              <label htmlFor="file-upload" className="sr-only">Choose files</label>
              <Input
                id="file-upload"
                type="file"
                multiple
                onChange={handleFileChange}
                className="block w-full text-xs sm:text-sm text-slate-500 file:mr-3 sm:file:mr-4 file:py-1.5 sm:file:py-2 file:px-2 sm:file:px-4 file:rounded-full file:border-0 file:text-xs sm:file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                disabled={isOverallLoading || isGeneratingSavedPdf || isEditingSavedReadme}
              />
            </div>

            {selectedFileDetails.length > 0 && (
              <div className="space-y-2 sm:space-y-3">
                <h3 className="text-sm sm:text-base md:text-lg font-semibold">Selected Files:</h3>
                <ScrollArea className="h-[120px] sm:h-[150px] w-full rounded-md border p-2 sm:p-3 bg-muted/30">
                  <ul className="space-y-1.5 sm:space-y-2">
                    {selectedFileDetails.map((file) => (
                      <li key={file.id} className="flex justify-between items-center p-1.5 sm:p-2 bg-background rounded shadow-sm hover:bg-accent/50 transition-colors">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                           <span dangerouslySetInnerHTML={{__html: FileTextIconSvg}} className="h-4 w-4 sm:h-5 sm:w-5 text-primary [&_svg]:h-full [&_svg]:w-full shrink-0"></span>
                           <span className="font-medium text-xs sm:text-sm truncate max-w-[100px] xs:max-w-[120px] sm:max-w-[200px] md:max-w-xs" title={file.name}>{file.name}</span>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2">
                          <span className="text-xs text-muted-foreground shrink-0">{formatFileSize(file.size)}</span>
                          <Button variant="ghost" size="icon" onClick={() => handleRemoveFile(file.id)} className="h-6 w-6 sm:h-7 sm:w-7 text-destructive hover:text-destructive/80 shrink-0" title="Remove file" disabled={isOverallLoading || isGeneratingSavedPdf || isEditingSavedReadme}>
                            <Trash2 className="h-3.5 sm:h-4 w-3.5 sm:h-4" />
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
                 <Button 
                    onClick={handleGenerateAllReadmes} 
                    className="w-full text-sm sm:text-base py-2 sm:py-2.5" 
                    disabled={isOverallLoading || selectedFileDetails.length === 0 || isGeneratingSavedPdf || isEditingSavedReadme}
                  >
                  {isOverallLoading ? (
                    <> <Loader2 className="mr-2 h-4 sm:h-5 w-4 sm:h-5 animate-spin" /> Generating READMEs... </>
                  ) : ( "Generate & Save READMEs from Files" )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {globalError && !isEditingSavedReadme && (
          <Alert variant="destructive" className="shadow-md w-full">
            <AlertTriangle className="h-4 w-4" /> <AlertTitle>Error</AlertTitle> <AlertDescription>{globalError}</AlertDescription>
          </Alert>
        )}
        
        {generatedFileReadmes.length > 0 && !isOverallLoading && !selectedSavedReadmeForDisplay && !isEditingSavedReadme && (
            <Card className="w-full shadow-xl mt-4 sm:mt-6 border hover:border-foreground transition-colors duration-200" id="generated-readmes-display">
                <CardHeader>
                    <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold font-headline">Newly Generated READMEs</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">Below are the READMEs generated in this session. They have also been added to your "Saved READMEs" list.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                    {generatedFileReadmes.map(genFile => (
                        <Card key={genFile.fileId} className="p-3 sm:p-4 rounded-md shadow-md bg-card border hover:border-foreground/50 transition-colors duration-200">
                            <CardHeader className="p-0 pb-2 sm:pb-3 mb-2 sm:mb-3 border-b border-border/60">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                                    <CardTitle className="text-md sm:text-lg font-semibold text-primary mb-1 sm:mb-0 truncate max-w-full sm:max-w-[calc(100%-120px)]" title={genFile.fileName}>{genFile.fileName}</CardTitle>
                                    {genFile.readmeData && !genFile.isLoading && (
                                    <Button onClick={() => handleDownloadIndividualReadme(genFile.readmeData!, genFile.fileName)} variant="outline" size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90 text-xs px-2 py-1 self-start sm:self-center mt-1 sm:mt-0" disabled={!genFile.readmeData}>
                                        <Download className="mr-1 h-3.5 w-3.5 sm:mr-1.5 sm:h-4 sm:w-4" /> Download .txt
                                    </Button>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="p-0" id={genFile.contentWrapperId}>
                                {genFile.isLoading && ( <div className="flex items-center space-x-2 py-4"> <Loader2 className="h-4 sm:h-5 w-4 sm:h-5 animate-spin text-primary" /> <span className="text-muted-foreground text-xs sm:text-sm">Generating for {genFile.fileName}...</span> </div> )}
                                {genFile.error && !genFile.isLoading && ( <Alert variant="destructive" className="my-2 text-xs sm:text-sm"> <AlertTriangle className="h-4 w-4" /> <AlertTitle>Gen Error</AlertTitle> <AlertDescription>{genFile.error}</AlertDescription> </Alert> )}
                                {genFile.readmeData && !genFile.isLoading && (
                                <ScrollArea className="h-[calc(100vh-450px)] min-h-[200px] sm:h-[250px] md:h-[300px] w-full rounded-md border border-border/50 p-2 sm:p-3 bg-background/50">
                                    <div className="space-y-1.5 sm:space-y-2">
                                      <div className="py-1 sm:py-1.5 border-b border-border/30 last:border-b-0"><MarkdownContentDisplay contentWrapperId={genFile.contentWrapperId + "-pn"} content={genFile.readmeData.projectName} title="AI Name" /></div>
                                      <div className="py-1 sm:py-1.5 border-b border-border/30 last:border-b-0"><MarkdownContentDisplay contentWrapperId={genFile.contentWrapperId + "-pd"} content={genFile.readmeData.projectDescription} title="Description" /></div>
                                      <div className="py-1 sm:py-1.5 border-b border-border/30 last:border-b-0"><MarkdownContentDisplay contentWrapperId={genFile.contentWrapperId + "-ft"} content={genFile.readmeData.features} title="Features" /></div>
                                      <div className="py-1 sm:py-1.5 border-b border-border/30 last:border-b-0"><MarkdownContentDisplay contentWrapperId={genFile.contentWrapperId + "-tu"} content={genFile.readmeData.technologiesUsed} title="Tech Used" /></div>
                                      <div className="py-1 sm:py-1.5 border-b border-border/30 last:border-b-0"><MarkdownContentDisplay contentWrapperId={genFile.contentWrapperId + "-fs"} content={genFile.readmeData.folderStructure} title="Folder Structure" /></div>
                                      <div className="py-1 sm:py-1.5 last:border-b-0"><MarkdownContentDisplay contentWrapperId={genFile.contentWrapperId + "-si"} content={genFile.readmeData.setupInstructions} title="Setup" /></div>
                                    </div>
                                </ScrollArea>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </CardContent>
            </Card>
        )}

        {/* Saved READMEs Section */}
        {loggedIn && savedReadmesList.length > 0 && !isEditingSavedReadme && (
            <Card className="w-full shadow-lg mt-4 sm:mt-6 border hover:border-foreground transition-colors duration-200">
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 pb-2">
                    <div className="flex-1">
                        <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold font-headline">Saved READMEs</CardTitle>
                        <CardDescription className="text-xs sm:text-sm">Manage your saved READMEs. (Max 20, visible only to you)</CardDescription>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="mt-2 sm:mt-0 w-full sm:w-auto text-xs px-2 py-1" disabled={isGeneratingSavedPdf || isOverallLoading || isEditingSavedReadme}>
                                {isGeneratingSavedPdf ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <span dangerouslySetInnerHTML={{__html: FileTextIconSvg}} className="mr-1.5 h-3.5 w-3.5 [&_svg]:h-full [&_svg]:w-full"></span>}
                                PDF Actions
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel className="text-xs">PDF Options</DropdownMenuLabel><DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleDownloadAllSavedAsPdf} disabled={isGeneratingSavedPdf || savedReadmesList.length === 0} className="text-xs">Merge All & Download</DropdownMenuItem>
                            <DropdownMenuItem onClick={handleDownloadSelectedSavedAsPdf} disabled={isGeneratingSavedPdf || selectedSavedReadmeIdsForPdf.length === 0} className="text-xs">Download Selected</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[200px] sm:h-[250px] w-full rounded-md border p-2">
                        <ul className="space-y-1.5 sm:space-y-2">
                            {savedReadmesList.map((item) => (
                            <li key={item.id} className="p-1.5 sm:p-2 bg-muted/50 rounded-md shadow-sm hover:bg-muted transition-colors">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                                <div className="flex items-center flex-1 min-w-0 space-x-1.5 sm:space-x-2 mb-1.5 sm:mb-0">
                                    <Checkbox id={`select-saved-pdf-${item.id}`} checked={selectedSavedReadmeIdsForPdf.includes(item.id)} onCheckedChange={(checked) => handleSavedPdfSelectionChange(item.id, checked)} aria-label={`Select ${item.projectName} for PDF`} disabled={isGeneratingSavedPdf || isOverallLoading || isEditingSavedReadme} className="mt-0.5 sm:mt-0 shrink-0"/>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-xs sm:text-sm text-primary truncate" title={item.projectName}>{item.projectName}</p>
                                        <p className="text-xs text-muted-foreground">
                                            Saved: {new Date(item.savedDate).toLocaleDateString()} {new Date(item.savedDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            {item.inputTypeUsed && <span className="hidden sm:inline"> (via {item.inputTypeUsed === 'file-upload' ? `file: ${item.originalInput?.substring(0,15)}...` : item.inputTypeUsed})</span>}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-1 self-end sm:self-center sm:space-x-1.5 ml-auto sm:ml-2 flex-shrink-0">
                                    <Button onClick={() => handleLoadSavedReadme(item)} variant="ghost" size="sm" className="text-primary hover:text-primary/80 p-1 h-7 w-auto text-xs" title="View README" disabled={isGeneratingDetailsForSaved || isOverallLoading || isGeneratingSavedPdf || isEditingSavedReadme}><Eye className="h-3.5 w-3.5" /> <span className="sr-only sm:not-sr-only sm:ml-1">View</span></Button>
                                    <Button onClick={() => handleDownloadSavedReadmeMd(item)} variant="outline" size="sm" className="p-1 h-7 w-auto text-xs" title="Download .md" disabled={isOverallLoading || isGeneratingSavedPdf || isEditingSavedReadme}><Download className="h-3.5 w-3.5" /> <span className="sr-only sm:not-sr-only sm:ml-1">.MD</span></Button>
                                    <Button onClick={() => handleDeleteSavedReadme(item.id)} variant="ghost" size="sm" className="text-destructive hover:text-destructive/80 p-1 h-7 w-auto text-xs" title="Delete" disabled={isOverallLoading || isGeneratingSavedPdf || isEditingSavedReadme}><Trash2 className="h-3.5 w-3.5" /> <span className="sr-only sm:not-sr-only sm:ml-1">Del</span></Button>
                                </div>
                                </div>
                            </li>
                            ))}
                        </ul>
                    </ScrollArea>
                    {savedReadmesList.length > 0 && (<p className="text-xs text-muted-foreground mt-2">{selectedSavedReadmeIdsForPdf.length} README(s) selected for PDF. Max 20 saved.</p>)}
                </CardContent>
            </Card>
        )}

        {/* Editor for Saved README */}
        {isEditingSavedReadme && editableSavedReadmeData && (
            <Card className="w-full max-w-3xl shadow-xl space-y-3 sm:space-y-4 border hover:border-foreground transition-colors duration-200 mt-4 sm:mt-6 p-3 sm:p-4 md:p-6">
                <CardHeader className="p-0 pb-2 sm:pb-3">
                    <CardTitle className="text-lg sm:text-xl font-bold text-center font-headline">Edit Saved README</CardTitle>
                    <CardDescription className="text-center text-xs sm:text-sm text-muted-foreground">Modify the sections below. Use Markdown.</CardDescription>
                </CardHeader>
                <CardContent className="p-0 space-y-2 sm:space-y-3">
                    <div><Label htmlFor="edit-saved-projectName" className="font-semibold text-xs sm:text-sm">Project Name</Label><Input id="edit-saved-projectName" value={editableSavedReadmeData.projectName} onChange={(e) => handleEditableSavedInputChange(e, 'projectName')} className="mt-1 text-xs sm:text-sm" /></div>
                    <div><Label htmlFor="edit-saved-projectDescription" className="font-semibold text-xs sm:text-sm">Project Description</Label><Textarea id="edit-saved-projectDescription" value={editableSavedReadmeData.projectDescription} onChange={(e) => handleEditableSavedInputChange(e, 'projectDescription')} className="mt-1 min-h-[80px] sm:min-h-[100px] text-xs sm:text-sm"/></div>
                    <div><Label htmlFor="edit-saved-features" className="font-semibold text-xs sm:text-sm">Features</Label><Textarea id="edit-saved-features" value={editableSavedReadmeData.features} onChange={(e) => handleEditableSavedInputChange(e, 'features')} className="mt-1 min-h-[100px] sm:min-h-[120px] text-xs sm:text-sm"/></div>
                    <div><Label htmlFor="edit-saved-technologiesUsed" className="font-semibold text-xs sm:text-sm">Technologies Used</Label><Textarea id="edit-saved-technologiesUsed" value={editableSavedReadmeData.technologiesUsed} onChange={(e) => handleEditableSavedInputChange(e, 'technologiesUsed')} className="mt-1 min-h-[60px] sm:min-h-[80px] text-xs sm:text-sm"/></div>
                    <div><Label htmlFor="edit-saved-folderStructure" className="font-semibold text-xs sm:text-sm">Folder Structure</Label><Textarea id="edit-saved-folderStructure" value={editableSavedReadmeData.folderStructure} onChange={(e) => handleEditableSavedInputChange(e, 'folderStructure')} className="mt-1 min-h-[100px] sm:min-h-[120px] text-xs sm:text-sm font-mono"/></div>
                    <div><Label htmlFor="edit-saved-setupInstructions" className="font-semibold text-xs sm:text-sm">Setup Instructions</Label><Textarea id="edit-saved-setupInstructions" value={editableSavedReadmeData.setupInstructions} onChange={(e) => handleEditableSavedInputChange(e, 'setupInstructions')} className="mt-1 min-h-[120px] sm:min-h-[150px] text-xs sm:text-sm"/></div>
                    <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-2 sm:pt-3">
                        <Button variant="outline" onClick={handleCancelEditsForSavedItem} className="text-xs py-1.5 px-3 w-full sm:w-auto"><XCircle className="mr-1.5 h-3.5 w-3.5" /> Cancel</Button>
                        <Button onClick={handleSaveChangesForSavedItem} className="text-xs py-1.5 px-3 bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"><Save className="mr-1.5 h-3.5 w-3.5" /> Save Edits</Button>
                    </div>
                </CardContent>
            </Card>
        )}

        {/* Display Area for a single loaded/viewed Saved README */}
        {selectedSavedReadmeForDisplay && !isEditingSavedReadme && (
            <div id="saved-readme-display-area" className="w-full mt-4 sm:mt-6">
                <ReadmeDisplay 
                    data={selectedSavedReadmeForDisplay} 
                    onGenerateDetails={handleGenerateDetailsForSavedItem}
                    isGeneratingDetails={isGeneratingDetailsForSaved} 
                    onEditRequest={handleEditRequestForSavedItem}
                />
            </div>
        )}


         <footer className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} ReadMeGenius. All rights reserved.</p>
        </footer>
      </div>
    </main>
  );
}

