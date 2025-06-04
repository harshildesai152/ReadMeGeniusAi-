
// src/app/past-files/page.tsx
"use client";

import type { ChangeEvent } from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Used for file input
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, AlertTriangle, UploadCloud, FileText, Download, Trash2 } from "lucide-react";
import { processGitHubRepo, type FullReadmeData } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";

interface FileDetail {
  id: string;
  name: string;
  size: number;
  type: string;
  content: string; // Store file content as string
}

// Re-purposed MarkdownContent from ReadmeDisplay for on-page rendering
const MarkdownContentDisplay: React.FC<{ content: string; title: string }> = ({ content, title }) => {
  if (!content) return <p className="text-muted-foreground">Not yet generated.</p>;

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
      <h3 className="text-lg font-semibold mb-1 pb-1 border-b font-headline">{title}:</h3>
      {lines}
    </div>
  );
};


export default function PastFilesPage() {
  const [selectedFileDetails, setSelectedFileDetails] = useState<FileDetail[]>([]);
  const [generatedReadmeData, setGeneratedReadmeData] = useState<FullReadmeData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!mounted) return;
    const files = event.target.files;
    if (!files || files.length === 0) {
      // If selection is cleared, clear existing files
      if (selectedFileDetails.length > 0) {
         // setSelectedFileDetails([]); 
         // setGeneratedReadmeData(null); // also clear generated content
         // setError(null);
      }
      return;
    }

    setError(null);
    setGeneratedReadmeData(null);
    const newFileDetails: FileDetail[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const content = await readFileAsText(file);
        newFileDetails.push({
          id: `${file.name}-${file.lastModified}-${file.size}`,
          name: file.name,
          size: file.size,
          type: file.type || "unknown",
          content: content,
        });
      } catch (e) {
        console.error("Error reading file:", file.name, e);
        setError(`Error reading file ${file.name}. It might be too large or not a text file.`);
        // Optionally clear all files if one fails, or just skip this one
        // setSelectedFileDetails([]); 
        return; 
      }
    }
    setSelectedFileDetails(prevDetails => [...prevDetails, ...newFileDetails].filter((v,i,a)=>a.findIndex(t=>(t.id === v.id))===i)); // Add new files, prevent duplicates based on ID

    // Clear the file input value so the same files can be re-selected if needed after removal
    if (event.target) {
      event.target.value = "";
    }
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file); // Assuming text files
    });
  };

  const handleRemoveFile = (fileIdToRemove: string) => {
    setSelectedFileDetails(prevDetails => prevDetails.filter(file => file.id !== fileIdToRemove));
    if (selectedFileDetails.length === 1) { // If last file removed
        setGeneratedReadmeData(null);
        setError(null);
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

  const handleGenerateReadme = async () => {
    if (!mounted || selectedFileDetails.length === 0) {
      setError("Please upload at least one file.");
      return;
    }
    setError(null);
    setIsLoading(true);
    setGeneratedReadmeData(null);

    // Concatenate file contents with markers
    const combinedCodeContent = selectedFileDetails
      .map(file => `// --- FILE: ${file.name} ---\n\n${file.content}\n\n// --- END FILE: ${file.name} ---`)
      .join("\n\n");
    
    const result = await processGitHubRepo({ codeContent: combinedCodeContent });

    if (result && "error" in result) {
      setError(result.error);
      setGeneratedReadmeData(null);
      toast({ title: "Generation Failed", description: result.error, variant: "destructive" });
    } else if (result) {
      setGeneratedReadmeData(result);
      toast({ title: "README Generated!", description: "The README has been generated from the uploaded files." });
    } else {
      setError("An unexpected error occurred during README generation.");
      setGeneratedReadmeData(null);
      toast({ title: "Generation Failed", description: "An unknown error occurred.", variant: "destructive" });
    }
    setIsLoading(false);
  };

  const formatReadmeForTxt = (readmeData: FullReadmeData): string => {
    // Basic text formatting, trying to make it readable in .txt
    // This could be more sophisticated to strip Markdown, but this is a start.
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
    `.trim().replace(/\n\n\n+/g, '\n\n'); // Consolidate multiple blank lines
  };

  const handleDownloadReadme = () => {
    if (!mounted || !generatedReadmeData) return;
    const readmeText = formatReadmeForTxt(generatedReadmeData);
    const blob = new Blob([readmeText], { type: 'text/plain;charset=utf--8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    const sanitizedProjectName = generatedReadmeData.projectName.replace(/[^a-z0-9_]/gi, '_').toLowerCase();
    link.download = `${sanitizedProjectName || 'readme'}.txt`; // Download as README.txt
    
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
        <header className="text-center w-full">
          <h1 className="text-4xl font-bold text-primary font-headline">Past Files Inventory & README Generator</h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Upload your project files, view them, and generate a README.md from their content.
          </p>
        </header>

        <Card className="w-full shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <UploadCloud className="h-7 w-7 text-primary" /> Upload Files
            </CardTitle>
            <CardDescription>
              Select one or more files from your project. Text-based files work best.
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
                disabled={isLoading}
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
                          <Button variant="ghost" size="icon" onClick={() => handleRemoveFile(file.id)} className="h-7 w-7 text-destructive hover:text-destructive/80" title="Remove file" disabled={isLoading}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
                 <Button 
                    onClick={handleGenerateReadme} 
                    className="w-full text-lg py-3" 
                    disabled={isLoading || selectedFileDetails.length === 0}
                  >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Generating README...
                    </>
                  ) : (
                    "Generate README from Files"
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive" className="shadow-md w-full">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {generatedReadmeData && !isLoading && (
          <Card className="w-full shadow-xl mt-8" id="generated-readme-display">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-2xl font-bold font-headline">Generated README Content</CardTitle>
              <Button onClick={handleDownloadReadme} variant="outline" size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90" disabled={!generatedReadmeData}>
                <Download className="mr-2 h-5 w-5" /> Download README.txt
              </Button>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] w-full rounded-md border p-4 bg-background">
                <div className="space-y-4">
                    <MarkdownContentDisplay content={generatedReadmeData.projectName} title="Project Name"/>
                    <MarkdownContentDisplay content={generatedReadmeData.projectDescription} title="Project Description"/>
                    <MarkdownContentDisplay content={generatedReadmeData.features} title="Features"/>
                    <MarkdownContentDisplay content={generatedReadmeData.technologiesUsed} title="Technologies Used"/>
                    <MarkdownContentDisplay content={generatedReadmeData.folderStructure} title="Folder Structure"/>
                    <MarkdownContentDisplay content={generatedReadmeData.setupInstructions} title="Setup Instructions"/>
                </div>
              </ScrollArea>
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

