
// src/app/past-files/page.tsx
"use client";

import type { ChangeEvent } from "react";
import { useState, useEffect, useRef } from "react";
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, AlertTriangle, UploadCloud, Download, Trash2, Home, LogIn, UserPlus, LogOut, LayoutDashboard } from "lucide-react";
import { processGitHubRepo, type FullReadmeData } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/theme-toggle";
import { isLoggedIn, setLoggedIn as setAuthLoggedIn, getCurrentUserEmail } from '@/lib/auth/storage';
import { useRouter } from 'next/navigation';
import React from 'react'; 
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
            data-copy-icon='${ClipboardCopySvg.replace(/'/g, "&apos;")}'
            data-check-icon='${CheckSvg.replace(/'/g, "&apos;")}'
            aria-label="Copy code to clipboard"
          >
            ${ClipboardCopySvg}
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
  const activeReadmeRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());


  useEffect(() => {
    setMounted(true);
    const checkLoginStatus = () => {
      setLoggedInStatus(isLoggedIn());
    };
    checkLoginStatus(); 
    window.addEventListener('storage', checkLoginStatus); 
    return () => {
      window.removeEventListener('storage', checkLoginStatus);
    };
  }, []);
  
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
                    const preElement = contentWrapperElement.querySelector(`#${targetId}`); // Query within the specific wrapper
                    if (preElement && preElement.textContent) {
                        try {
                            await navigator.clipboard.writeText(preElement.textContent);
                            newButton.innerHTML = newButton.dataset.checkIcon || CheckSvg;
                            newButton.classList.add('text-green-500');
                            toast({ title: "Code Copied!", description: `Code from ${genFile.fileName} copied.` });
                            setTimeout(() => {
                                newButton.innerHTML = newButton.dataset.copyIcon || ClipboardCopySvg;
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

  const handleGenerateAllReadmes = async () => {
    if (!mounted) return;

    if (!loggedIn) {
      toast({
        title: "Authentication Required",
        description: "Please log in to generate READMEs from files.",
        variant: "destructive",
      });
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
          setGeneratedFileReadmes(prev =>
            prev.map(item =>
              item.fileId === fileDetail.id ? { ...item, error: result.error, readmeData: null, isLoading: false } : item
            )
          );
          toast({ title: `Generation Failed: ${fileDetail.name}`, description: result.error, variant: "destructive", duration: 5000 });
        } else if (result) {
          setGeneratedFileReadmes(prev =>
            prev.map(item =>
              item.fileId === fileDetail.id ? { ...item, readmeData: result, error: null, isLoading: false } : item
            )
          );
          toast({ title: `README Generated: ${fileDetail.name}`, description: `Successfully generated README for ${fileDetail.name}.`, duration: 3000 });
        } else {
           setGeneratedFileReadmes(prev =>
            prev.map(item =>
              item.fileId === fileDetail.id ? { ...item, error: "An unknown error occurred during README generation.", readmeData: null, isLoading: false } : item
            )
          );
          toast({ title: `Generation Failed: ${fileDetail.name}`, description: "An unknown error occurred.", variant: "destructive", duration: 5000 });
        }
      } catch (e: any) {
         setGeneratedFileReadmes(prev =>
          prev.map(item =>
            item.fileId === fileDetail.id ? { ...item, error: e.message || `An unexpected processing error occurred for ${fileDetail.name}.`, readmeData: null, isLoading: false } : item
          )
        );
         toast({ title: `Processing Error: ${fileDetail.name}`, description: e.message || "An unexpected error occurred.", variant: "destructive", duration: 5000 });
      }
    }
    setIsOverallLoading(false);
  };

  const formatReadmeForTxt = (readmeData: FullReadmeData): string => {
    const cleanText = (text: string) => {
        if (!text) return "N/A";
        return text
            .replace(/^#+\s*/gm, '') 
            .replace(/^- /gm, '* ')   
            .replace(/```[\s\S]*?```/g, '(Code Block)') 
            .replace(/`([^`]+)`/g, '$1'); 
    };
    
    return `
Project Name: ${cleanText(readmeData.projectName)}

--------------------
Project Description:
--------------------
${cleanText(readmeData.projectDescription)}

--------------------
Features:
--------------------
${cleanText(readmeData.features)}

--------------------
Technologies Used:
--------------------
${cleanText(readmeData.technologiesUsed)}

--------------------
Folder Structure:
--------------------
${cleanText(readmeData.folderStructure)} 
(Note: For complex structures, refer to original code or use Markdown viewer.)

--------------------
Setup Instructions:
--------------------
${cleanText(readmeData.setupInstructions)}
    `.trim().replace(/\n\n\n+/g, '\n\n'); 
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
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);

    toast({
      title: "README Downloading...",
      description: `${link.download} will be downloaded.`,
    });
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
        
        <header className="w-full mb-4 sm:mb-6">
          <nav className="flex justify-between items-center w-full py-2 sm:py-3 border-b mb-3 sm:mb-4">
            <div className="flex items-center space-x-1 sm:space-x-2">
              <Link href="/" passHref>
                <Button variant="outline" size="icon" title="Go to Home Page" className="h-8 w-8 sm:h-9 sm:w-9">
                  <Home className="h-4 sm:h-5 w-4 sm:h-5" />
                </Button>
              </Link>
            </div>
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
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary font-headline">Past Files Inventory &amp; README Generator</h1>
            <p className="mt-1.5 sm:mt-2 text-sm sm:text-base md:text-lg text-muted-foreground">
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
              Select one or more files. A separate README will be generated for each file. Max total size recommended: ~5MB per file.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            <div>
              <label htmlFor="file-upload" className="sr-only">Choose files</label>
              <Input
                id="file-upload"
                type="file"
                multiple
                onChange={handleFileChange}
                className="block w-full text-xs sm:text-sm text-slate-500 file:mr-3 sm:file:mr-4 file:py-1.5 sm:file:py-2 file:px-2 sm:file:px-4 file:rounded-full file:border-0 file:text-xs sm:file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                disabled={isOverallLoading}
              />
            </div>

            {selectedFileDetails.length > 0 && (
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-sm sm:text-base md:text-lg font-semibold">Selected Files:</h3>
                <ScrollArea className="h-[150px] sm:h-[200px] w-full rounded-md border p-2 sm:p-3 bg-muted/30">
                  <ul className="space-y-1.5 sm:space-y-2">
                    {selectedFileDetails.map((file) => (
                      <li key={file.id} className="flex justify-between items-center p-1.5 sm:p-2 bg-background rounded shadow-sm hover:bg-accent/50 transition-colors">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                           <span dangerouslySetInnerHTML={{__html: FileTextIconSvg}} className="h-4 w-4 sm:h-5 sm:w-5 text-primary [&_svg]:h-full [&_svg]:w-full"></span>
                           <span className="font-medium text-xs sm:text-sm truncate max-w-[120px] xs:max-w-[150px] sm:max-w-xs md:max-w-sm" title={file.name}>{file.name}</span>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2">
                          <span className="text-xs text-muted-foreground">{formatFileSize(file.size)}</span>
                          <Button variant="ghost" size="icon" onClick={() => handleRemoveFile(file.id)} className="h-6 w-6 sm:h-7 sm:w-7 text-destructive hover:text-destructive/80" title="Remove file" disabled={isOverallLoading}>
                            <Trash2 className="h-3.5 sm:h-4 w-3.5 sm:h-4" />
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
                 <Button 
                    onClick={handleGenerateAllReadmes} 
                    className="w-full text-sm sm:text-base md:text-lg py-2 sm:py-2.5" 
                    disabled={isOverallLoading || selectedFileDetails.length === 0}
                  >
                  {isOverallLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 sm:h-5 w-4 sm:h-5 animate-spin" />
                      Generating READMEs...
                    </>
                  ) : (
                    "Generate READMEs from Files"
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {globalError && (
          <Alert variant="destructive" className="shadow-md w-full">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{globalError}</AlertDescription>
          </Alert>
        )}
        
        {generatedFileReadmes.length > 0 && (
            <Card className="w-full shadow-xl mt-6 sm:mt-8 border hover:border-foreground transition-colors duration-200" id="generated-readmes-display">
                <CardHeader>
                    <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold font-headline">Generated READMEs</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">Below are the individually generated READMEs for your uploaded files.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6">
                    {generatedFileReadmes.map(genFile => (
                        <Card key={genFile.fileId} className="p-3 sm:p-4 rounded-md shadow-md bg-card border hover:border-foreground transition-colors duration-200">
                            <CardHeader className="p-0 pb-2 sm:pb-3 mb-2 sm:mb-3 border-b border-border/60">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                                    <CardTitle className="text-md sm:text-lg font-semibold text-primary mb-1 sm:mb-0 truncate max-w-full sm:max-w-[calc(100%-120px)]" title={genFile.fileName}>{genFile.fileName}</CardTitle>
                                    {genFile.readmeData && !genFile.isLoading && (
                                    <Button 
                                        onClick={() => handleDownloadIndividualReadme(genFile.readmeData!, genFile.fileName)} 
                                        variant="outline" 
                                        size="sm"
                                        className="bg-accent text-accent-foreground hover:bg-accent/90 text-xs px-2 py-1 self-start sm:self-center"
                                        disabled={!genFile.readmeData}
                                    >
                                        <Download className="mr-1 h-3.5 w-3.5 sm:mr-1.5 sm:h-4 sm:w-4" /> Download .txt
                                    </Button>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="p-0" id={genFile.contentWrapperId}>
                                {genFile.isLoading && (
                                <div className="flex items-center space-x-2 py-4">
                                    <Loader2 className="h-4 sm:h-5 w-4 sm:h-5 animate-spin text-primary" />
                                    <span className="text-muted-foreground text-xs sm:text-sm">Generating README for {genFile.fileName}...</span>
                                </div>
                                )}
                                {genFile.error && !genFile.isLoading && (
                                <Alert variant="destructive" className="my-2 text-xs sm:text-sm">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertTitle>Generation Error</AlertTitle>
                                    <AlertDescription>{genFile.error}</AlertDescription>
                                </Alert>
                                )}
                                {genFile.readmeData && !genFile.isLoading && (
                                <ScrollArea className="h-[calc(100vh-400px)] min-h-[250px] sm:h-[300px] md:h-[400px] w-full rounded-md border border-border/50 p-2 sm:p-3 bg-background/50">
                                    <div className="space-y-1.5 sm:space-y-2">
                                      <div className="py-1.5 sm:py-2 border-b border-border/30 last:border-b-0">
                                        <MarkdownContentDisplay contentWrapperId={genFile.contentWrapperId + "-pn"} content={genFile.readmeData.projectName} title="AI Suggested Project Name" />
                                      </div>
                                      <div className="py-1.5 sm:py-2 border-b border-border/30 last:border-b-0">
                                        <MarkdownContentDisplay contentWrapperId={genFile.contentWrapperId + "-pd"} content={genFile.readmeData.projectDescription} title="Project Description" />
                                      </div>
                                      <div className="py-1.5 sm:py-2 border-b border-border/30 last:border-b-0">
                                        <MarkdownContentDisplay contentWrapperId={genFile.contentWrapperId + "-ft"} content={genFile.readmeData.features} title="Features" />
                                      </div>
                                      <div className="py-1.5 sm:py-2 border-b border-border/30 last:border-b-0">
                                        <MarkdownContentDisplay contentWrapperId={genFile.contentWrapperId + "-tu"} content={genFile.readmeData.technologiesUsed} title="Technologies Used" />
                                      </div>
                                      <div className="py-1.5 sm:py-2 border-b border-border/30 last:border-b-0">
                                        <MarkdownContentDisplay contentWrapperId={genFile.contentWrapperId + "-fs"} content={genFile.readmeData.folderStructure} title="Folder Structure" />
                                      </div>
                                      <div className="py-1.5 sm:py-2 last:border-b-0">
                                        <MarkdownContentDisplay contentWrapperId={genFile.contentWrapperId + "-si"} content={genFile.readmeData.setupInstructions} title="Setup Instructions" />
                                      </div>
                                    </div>
                                </ScrollArea>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </CardContent>
            </Card>
        )}

         <footer className="mt-8 sm:mt-12 text-center text-xs sm:text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} ReadMeGenius. All rights reserved.</p>
        </footer>
      </div>
    </main>
  );
}

