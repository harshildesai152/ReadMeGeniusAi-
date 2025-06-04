
// src/app/past-files/page.tsx
"use client";

import type { ChangeEvent } from "react";
import { useState, useEffect } from "react";
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, AlertTriangle, UploadCloud, FileText, Download, Trash2, Home } from "lucide-react";
import { processGitHubRepo, type FullReadmeData } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";

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
}

const MarkdownContentDisplay: React.FC<{ content: string; title: string }> = ({ content, title }) => {
  if (!content && content !== "") return <p className="text-muted-foreground">Not yet generated or N/A.</p>;
  if (content.trim() === "") return <p className="text-muted-foreground">Content is empty.</p>;


  const lines = content.split('\n').map((line, index) => {
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      return <li key={index} className="ml-4 list-disc">{line.substring(line.indexOf(' ') + 1)}</li>;
    }
    if (line.match(/^#{1,6}\s/)) { 
        const level = line.match(/^#+/)![0].length;
        const text = line.replace(/^#+\s/, '');
        const Tag = `h${level + 2}` as keyof JSX.IntrinsicElements;
        return <Tag key={index} className={`font-semibold mt-2 mb-1 ${level === 1 ? 'text-lg' : level === 2 ? 'text-base' : 'text-sm'}`}>{text}</Tag>;
    }
    if (line.trim().startsWith('```') && index > 0 && content.split('\n')[index-1].trim().startsWith('```')) {
      return <pre key={index} className="bg-muted p-2 rounded-md text-sm overflow-x-auto my-2">{line}</pre>;
    }
     if (line.trim().startsWith('    ') || line.trim().startsWith('\t')) { 
      return <p key={index} className="mb-0.5 whitespace-pre-wrap font-mono text-sm">{line || <>&nbsp;</>}</p>;
    }
    return <p key={index} className="mb-1">{line || <>&nbsp;</>}</p>;
  });

  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      <h4 className="text-md font-semibold mb-1 pb-1 border-b font-headline">{title}:</h4>
      {lines}
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

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!mounted) return;
    const files = event.target.files;
    if (!files || files.length === 0) {
      return;
    }

    setGlobalError(null);
    setGeneratedFileReadmes([]); // Clear previous generations
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
    if (selectedFileDetails.length === 1) {
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
    if (!mounted || selectedFileDetails.length === 0) {
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
    return `
Project Name: ${readmeData.projectName}

--------------------
Project Description:
--------------------
${readmeData.projectDescription.replace(/###\s*/g, '').replace(/##\s*/g, '').replace(/#\s*/g, '')}

--------------------
Features:
--------------------
${readmeData.features.replace(/^- /gm, '* ').replace(/###\s*/g, '').replace(/##\s*/g, '').replace(/#\s*/g, '')}

--------------------
Technologies Used:
--------------------
${readmeData.technologiesUsed.replace(/^- /gm, '* ').replace(/###\s*/g, '').replace(/##\s*/g, '').replace(/#\s*/g, '')}

--------------------
Folder Structure:
--------------------
${readmeData.folderStructure.replace(/```[\s\S]*?\n/g, '').replace(/```/g, '')} 

--------------------
Setup Instructions:
--------------------
${readmeData.setupInstructions.replace(/```[\s\S]*?```/g, '(Code Block)').replace(/`([^`]+)`/g, '$1').replace(/^- /gm, '* ').replace(/###\s*/g, '').replace(/##\s*/g, '').replace(/#\s*/g, '')}
    `.trim().replace(/\n\n\n+/g, '\n\n');
  };

  const handleDownloadIndividualReadme = (readmeData: FullReadmeData, originalFileName: string) => {
    if (!mounted || !readmeData) return;
    const readmeText = formatReadmeForTxt(readmeData);
    const blob = new Blob([readmeText], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    
    const baseName = originalFileName.substring(0, originalFileName.lastIndexOf('.')) || originalFileName;
    const sanitizedBaseName = baseName.replace(/[^a-z0-9_]/gi, '_').toLowerCase();
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
      <main className="flex min-h-screen flex-col items-center justify-start p-6 sm:p-12 md:p-24 bg-background">
        <div className="w-full max-w-3xl space-y-8 text-center">
          <h1 className="text-3xl font-bold">Loading Past Files Section...</h1>
           <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-6 sm:p-12 md:p-24 bg-background">
      <div className="container mx-auto flex flex-col items-center gap-12 w-full max-w-4xl">
        <header className="w-full flex justify-between items-start">
          <div className="text-center flex-grow">
            <h1 className="text-4xl font-bold text-primary font-headline">Past Files Inventory & README Generator</h1>
            <p className="mt-3 text-lg text-muted-foreground">
              Upload project files to generate individual READMEs for each.
            </p>
          </div>
          <Link href="/" passHref>
            <Button variant="outline" size="lg" className="ml-4 flex-shrink-0">
              <Home className="mr-2 h-5 w-5" />
              Home
            </Button>
          </Link>
        </header>

        <Card className="w-full shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <UploadCloud className="h-7 w-7 text-primary" /> Upload Files
            </CardTitle>
            <CardDescription>
              Select one or more files. A separate README will be generated for each file.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label htmlFor="file-upload" className="sr-only">Choose files</label>
              <Input
                id="file-upload"
                type="file"
                multiple
                onChange={handleFileChange}
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                disabled={isOverallLoading}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                You can select multiple files. Max total size recommended: ~5MB.
              </p>
            </div>

            {selectedFileDetails.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Selected Files:</h3>
                <ScrollArea className="h-[200px] w-full rounded-md border p-3 bg-muted/30">
                  <ul className="space-y-2">
                    {selectedFileDetails.map((file) => (
                      <li key={file.id} className="flex justify-between items-center p-2 bg-background rounded shadow-sm hover:bg-accent/50 transition-colors">
                        <div className="flex items-center gap-2">
                           <FileText className="h-5 w-5 text-primary" />
                           <span className="font-medium text-sm">{file.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{formatFileSize(file.size)}</span>
                          <Button variant="ghost" size="icon" onClick={() => handleRemoveFile(file.id)} className="h-7 w-7 text-destructive hover:text-destructive/80" title="Remove file" disabled={isOverallLoading}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
                 <Button 
                    onClick={handleGenerateAllReadmes} 
                    className="w-full text-lg py-3" 
                    disabled={isOverallLoading || selectedFileDetails.length === 0}
                  >
                  {isOverallLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
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
            <Card className="w-full shadow-xl mt-8" id="generated-readmes-display">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold font-headline">Generated READMEs</CardTitle>
                    <CardDescription>Below are the individually generated READMEs for your uploaded files.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {generatedFileReadmes.map(genFile => (
                        <Card key={genFile.fileId} className="p-4 rounded-md shadow-md">
                            <CardHeader className="p-0 pb-2 mb-2 border-b">
                                <div className="flex justify-between items-center">
                                    <CardTitle className="text-xl font-semibold text-primary">{genFile.fileName}</CardTitle>
                                    {genFile.readmeData && !genFile.isLoading && (
                                    <Button 
                                        onClick={() => handleDownloadIndividualReadme(genFile.readmeData!, genFile.fileName)} 
                                        variant="outline" 
                                        size="sm"
                                        className="bg-accent text-accent-foreground hover:bg-accent/90"
                                        disabled={!genFile.readmeData}
                                    >
                                        <Download className="mr-2 h-4 w-4" /> Download README.txt
                                    </Button>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                {genFile.isLoading && (
                                <div className="flex items-center space-x-2 py-4">
                                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                                    <span className="text-muted-foreground">Generating README for {genFile.fileName}...</span>
                                </div>
                                )}
                                {genFile.error && !genFile.isLoading && (
                                <Alert variant="destructive" className="my-2">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertTitle>Generation Error</AlertTitle>
                                    <AlertDescription>{genFile.error}</AlertDescription>
                                </Alert>
                                )}
                                {genFile.readmeData && !genFile.isLoading && (
                                <ScrollArea className="h-[450px] w-full rounded-md border p-3 bg-background">
                                    <div className="space-y-3">
                                        <MarkdownContentDisplay content={genFile.readmeData.projectName} title="AI Suggested Project Name" />
                                        <MarkdownContentDisplay content={genFile.readmeData.projectDescription} title="Project Description" />
                                        <MarkdownContentDisplay content={genFile.readmeData.features} title="Features" />
                                        <MarkdownContentDisplay content={genFile.readmeData.technologiesUsed} title="Technologies Used" />
                                        <MarkdownContentDisplay content={genFile.readmeData.folderStructure} title="Folder Structure" />
                                        <MarkdownContentDisplay content={genFile.readmeData.setupInstructions} title="Setup Instructions" />
                                    </div>
                                </ScrollArea>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </CardContent>
            </Card>
        )}

         <footer className="mt-12 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} ReadMeGenius. All rights reserved.</p>
        </footer>
      </div>
    </main>
  );
}

    