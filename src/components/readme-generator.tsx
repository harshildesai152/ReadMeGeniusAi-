
// src/components/readme-generator.tsx
"use client";

import { useState, useEffect, FormEvent, ChangeEvent as ReactTextareaChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, AlertTriangle, Github, Eye, Trash2, Download, MessagesSquare, ClipboardPaste, Save, XCircle } from "lucide-react"; 
import { processGitHubRepo, generateDetailedReadme, type FullReadmeData } from "@/lib/actions";
import { ReadmeDisplay } from "./readme-display";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { isLoggedIn, getCurrentUserEmail } from "@/lib/auth/storage";
import { useRouter } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
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


type InputType = "url" | "code" | "prompt";

interface SavedReadmeItem extends FullReadmeData {
  id: string;
  savedDate: string;
  inputTypeUsed?: InputType;
  originalInput?: string;
}
const FileTextIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>`;

// Helper function to convert a single README item to a simplified HTML string
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
      // Basic Markdown-like list handling for HTML
      const lines = content.split('\n');
      let listOpen = false;
      const processedContent = lines.map(line => {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
          if (!listOpen) {
            listOpen = true;
            return `<ul><li style="font-size: 13px; line-height: 1.5; color: #555; margin-bottom: 4px;">${trimmedLine.substring(2).replace(/</g, "&lt;").replace(/>/g, "&gt;")}</li>`;
          }
          return `<li style="font-size: 13px; line-height: 1.5; color: #555; margin-bottom: 4px;">${trimmedLine.substring(2).replace(/</g, "&lt;").replace(/>/g, "&gt;")}</li>`;
        } else {
          if (listOpen) {
            listOpen = false;
            return `</ul><p style="font-size: 13px; line-height: 1.5; color: #555; margin-bottom: 4px;">${line.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>`;
          }
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


export function ReadmeGenerator() {
  const [inputType, setInputType] = useState<InputType>("url");
  const [repoUrl, setRepoUrl] = useState<string>("");
  const [userPrompt, setUserPrompt] = useState<string>("");
  const [pastedCode, setPastedCode] = useState<string>("");
  const [generatedReadmeData, setGeneratedReadmeData] = useState<FullReadmeData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGeneratingDetails, setIsGeneratingDetails] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [savedReadmes, setSavedReadmes] = useState<SavedReadmeItem[]>([]);
  const [currentReadmeIdForDetail, setCurrentReadmeIdForDetail] = useState<string | null>(null);
  
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editableReadmeData, setEditableReadmeData] = useState<FullReadmeData | null>(null);

  const [selectedReadmeIdsForPdf, setSelectedReadmeIdsForPdf] = useState<string[]>([]);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);


  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const loggedIn = isLoggedIn();
      if (loggedIn) {
        const userEmail = getCurrentUserEmail();
        if (userEmail) {
          const userSavedReadmesKey = `savedReadmes_${userEmail}`;
          const storedReadmes = localStorage.getItem(userSavedReadmesKey);
          if (storedReadmes) {
            try {
              setSavedReadmes(JSON.parse(storedReadmes));
            } catch (e) {
              console.error(`Failed to parse saved READMEs for ${userEmail} from localStorage`, e);
              localStorage.removeItem(userSavedReadmesKey);
              setSavedReadmes([]);
            }
          } else {
            setSavedReadmes([]);
          }
        } else {
          setSavedReadmes([]); 
        }
      } else {
        setSavedReadmes([]);
      }
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      const loggedIn = isLoggedIn();
      if (loggedIn) {
        const userEmail = getCurrentUserEmail();
        if (userEmail) {
          const userSavedReadmesKey = `savedReadmes_${userEmail}`;
          if (savedReadmes.length > 0 || localStorage.getItem(userSavedReadmesKey)) { 
            localStorage.setItem(userSavedReadmesKey, JSON.stringify(savedReadmes));
          }
        }
      }
    }
  }, [savedReadmes, mounted]);


  const handleSaveReadme = (readmeToSave: FullReadmeData, inputTypeUsed: InputType, originalInput: string): SavedReadmeItem | undefined => {
    if (!mounted || !isLoggedIn() || !getCurrentUserEmail()) return undefined;

    const newReadme: SavedReadmeItem = {
      ...readmeToSave,
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      savedDate: new Date().toISOString(),
      inputTypeUsed,
      originalInput,
    };
    setSavedReadmes((prev) => {
      const updatedReadmes = [newReadme, ...prev.slice(0, 19)]; 
      return updatedReadmes;
    });
    toast({
      title: "README Automatically Saved!",
      description: `${newReadme.projectName} has been added to your saved list.`,
    });
    return newReadme;
  };

  const handleDeleteReadme = (id: string) => {
    if (!mounted || !isLoggedIn() || !getCurrentUserEmail()) return;
    setSavedReadmes((prev) => prev.filter((item) => item.id !== id));
    setSelectedReadmeIdsForPdf(prev => prev.filter(selectedId => selectedId !== id)); // Also remove from selection
    if (generatedReadmeData && currentReadmeIdForDetail === id) {
        setGeneratedReadmeData(null); 
        setCurrentReadmeIdForDetail(null);
    }
    toast({
      title: "README Deleted",
      description: "The saved README has been removed.",
      variant: "destructive",
    });
  };

  const handleLoadReadme = (readmeItem: SavedReadmeItem) => {
    if (!mounted || !isLoggedIn() || !getCurrentUserEmail()) return;
    setGeneratedReadmeData(readmeItem);
    setCurrentReadmeIdForDetail(readmeItem.id); 
    setIsEditing(false); 
    setEditableReadmeData(null);
    setError(null);
    toast({
      title: "README Loaded",
      description: `${readmeItem.projectName} is now displayed.`,
    });
    const displayElement = document.getElementById("readme-display-card");
    if (displayElement) {
      displayElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleDownloadReadmeMd = (readmeItem: FullReadmeData) => { 
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

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);

    toast({
      title: "README.md Downloading...",
      description: `${link.download} will be downloaded.`,
    });
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!mounted) return;

    if (!isLoggedIn()) {
      toast({
        title: "Authentication Required",
        description: "Please log in to generate a README.",
        variant: "destructive",
      });
      router.push('/auth/login');
      return;
    }

    setError(null);
    setIsLoading(true);
    setGeneratedReadmeData(null);
    setCurrentReadmeIdForDetail(null);
    setIsEditing(false); 
    setEditableReadmeData(null);

    let result;
    let originalInputValue = "";

    if (inputType === "url") {
      if (!repoUrl) {
        setError("Please enter a GitHub repository URL.");
        setIsLoading(false);
        return;
      }
      try {
        const url = new URL(repoUrl);
        if (url.hostname !== 'github.com') {
          setError("Please enter a valid GitHub repository URL.");
          setIsLoading(false);
          return;
        }
      } catch (_) {
        setError("Invalid URL format.");
        setIsLoading(false);
        return;
      }
      originalInputValue = repoUrl;
      result = await processGitHubRepo({ repoUrl });
    } else if (inputType === "code") {
      if (!pastedCode.trim()) {
        setError("Please paste your code content.");
        setIsLoading(false);
        return;
      }
      originalInputValue = pastedCode;
      result = await processGitHubRepo({ codeContent: pastedCode });
    } else if (inputType === "prompt") {
      if (!userPrompt.trim()) {
        setError("Please enter a prompt to generate the README.");
        setIsLoading(false);
        return;
      }
      originalInputValue = userPrompt;
      result = await processGitHubRepo({ userPrompt });
    }

    if (result && "error" in result) {
      setError(result.error);
      setGeneratedReadmeData(null);
    } else if (result) {
      setGeneratedReadmeData(result);
      const savedItem = handleSaveReadme(result, inputType, originalInputValue);
      if (savedItem) {
        setCurrentReadmeIdForDetail(savedItem.id);
      }
    } else {
      setError("An unexpected error occurred.");
      setGeneratedReadmeData(null);
    }
    setIsLoading(false);
  };

  const handleGenerateDetails = async (currentData: FullReadmeData) => {
    if (!mounted || !isLoggedIn() || !currentData) return;
    if (isEditing) {
        toast({ title: "Save or Cancel Edits", description: "Please save or cancel your current edits before generating more details.", variant: "destructive"});
        return;
    }

    setError(null);
    setIsGeneratingDetails(true);

    const result = await generateDetailedReadme(currentData);

    if (result && "error" in result) {
      setError(result.error);
      toast({ title: "Detail Generation Failed", description: result.error, variant: "destructive" });
    } else if (result) {
      setGeneratedReadmeData(result);
      if (currentReadmeIdForDetail) {
        setSavedReadmes(prev => prev.map(item =>
          item.id === currentReadmeIdForDetail
            ? { ...item, ...result, savedDate: new Date().toISOString() } 
            : item
        ));
        toast({ title: "README Enhanced & Saved!", description: "The detailed README has been updated and saved to your list." });
      } else {
        toast({ title: "README Enhanced!", description: "The README has been updated with more details." });
      }
    } else {
      setError("An unexpected error occurred while generating details.");
      toast({ title: "Detail Generation Failed", description: "An unknown error occurred.", variant: "destructive" });
    }
    setIsGeneratingDetails(false);
  };

  const handleEditRequest = () => {
    if (generatedReadmeData) {
      setEditableReadmeData({ ...generatedReadmeData });
      setIsEditing(true);
      setError(null); 
    }
  };

  const handleEditableInputChange = (
    e: ReactTextareaChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: keyof FullReadmeData
  ) => {
    if (editableReadmeData) {
      setEditableReadmeData({
        ...editableReadmeData,
        [field]: e.target.value,
      });
    }
  };

  const handleSaveChanges = () => {
    if (editableReadmeData) {
      setGeneratedReadmeData(editableReadmeData);
      if (currentReadmeIdForDetail) {
        setSavedReadmes(prev => prev.map(item =>
          item.id === currentReadmeIdForDetail
            ? { ...item, ...editableReadmeData, savedDate: new Date().toISOString() }
            : item
        ));
        toast({ title: "Edits Saved!", description: "Your changes to the README have been saved." });
      } else {
        const savedItem = handleSaveReadme(editableReadmeData, inputType, 
            inputType === 'url' ? repoUrl : (inputType === 'code' ? pastedCode : userPrompt)
        );
        if (savedItem) {
            setCurrentReadmeIdForDetail(savedItem.id);
        }
         toast({ title: "Edits Saved!", description: "Your changes have been saved as a new README." });
      }
      setIsEditing(false);
      setEditableReadmeData(null);
    }
  };

  const handleCancelEdits = () => {
    setIsEditing(false);
    setEditableReadmeData(null);
    toast({ title: "Edits Cancelled", description: "Your changes were not saved.", variant: "default" });
  };

  const handlePdfSelectionChange = (readmeId: string, checked: boolean | "indeterminate") => {
    if (checked === true) {
      setSelectedReadmeIdsForPdf(prev => [...prev, readmeId]);
    } else {
      setSelectedReadmeIdsForPdf(prev => prev.filter(id => id !== readmeId));
    }
  };

  const generateAndDownloadPdf = async (readmesToProcess: SavedReadmeItem[], fileName: string) => {
    if (!mounted || readmesToProcess.length === 0) {
      toast({ title: "No READMEs to Export", description: "Please select at least one README or use 'Merge All'.", variant: "destructive" });
      return;
    }
    setIsGeneratingPdf(true);
    toast({ title: "Generating PDF...", description: "This may take a moment." });

    try {
      const combinedHtml = readmesToProcess.map(readme => readmeToSimplifiedHtml(readme)).join('');
      
      const pdfContainer = document.createElement('div');
      pdfContainer.style.position = 'absolute';
      pdfContainer.style.left = '-9999px'; // Position off-screen
      pdfContainer.style.width = '800px'; // A4-like width for better canvas rendering
      pdfContainer.innerHTML = combinedHtml;
      document.body.appendChild(pdfContainer);

      const canvas = await html2canvas(pdfContainer, {
        scale: 2, // Increase scale for better quality
        useCORS: true,
        logging: false,
        width: pdfContainer.scrollWidth,
        height: pdfContainer.scrollHeight,
        windowWidth: pdfContainer.scrollWidth,
        windowHeight: pdfContainer.scrollHeight,
      });
      
      document.body.removeChild(pdfContainer);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'px', // Use pixels for easier coordination with canvas
        format: [canvas.width, canvas.height] // Set PDF page size to canvas size
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`${fileName}.pdf`);

      toast({ title: "PDF Generated!", description: `${fileName}.pdf has been downloaded.` });
    } catch (e: any) {
      console.error("PDF Generation Error:", e);
      toast({ title: "PDF Generation Failed", description: e.message || "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadAllAsPdf = () => {
    generateAndDownloadPdf(savedReadmes, "all_readmes_merged");
  };

  const handleDownloadSelectedAsPdf = () => {
    const selectedReadmes = savedReadmes.filter(readme => selectedReadmeIdsForPdf.includes(readme.id));
    if (selectedReadmes.length === 0) {
      toast({ title: "No READMEs Selected", description: "Please select at least one README to download.", variant: "destructive"});
      return;
    }
    generateAndDownloadPdf(selectedReadmes, "selected_readmes_merged");
  };


  if (!mounted) {
    return (
      <div className="w-full max-w-3xl space-y-8">
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl sm:text-3xl font-bold text-center font-headline">Generate Your README</CardTitle>
            <CardDescription className="text-center text-sm sm:text-base text-muted-foreground">
              Loading README generator...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse space-y-4">
              <div className="h-10 bg-muted rounded-md"></div>
              <div className="h-10 bg-muted rounded-md w-full sm:w-1/2 mx-auto"></div> {/* Adjusted for radio group stacking */}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isEditing && editableReadmeData) {
    return (
      <Card className="w-full max-w-3xl shadow-xl space-y-4 sm:space-y-6 border hover:border-foreground transition-colors duration-200">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl font-bold text-center font-headline">Edit README Content</CardTitle>
          <CardDescription className="text-center text-xs sm:text-sm text-muted-foreground">
            Modify the sections below. Use Markdown for formatting (e.g., ## for headings, **bold**).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          <div>
            <Label htmlFor="edit-projectName" className="font-semibold text-sm sm:text-base">Project Name</Label>
            <Input 
              id="edit-projectName" 
              value={editableReadmeData.projectName} 
              onChange={(e) => handleEditableInputChange(e, 'projectName')}
              className="mt-1 text-sm sm:text-base" 
            />
          </div>
          <div>
            <Label htmlFor="edit-projectDescription" className="font-semibold text-sm sm:text-base">Project Description</Label>
            <Textarea 
              id="edit-projectDescription" 
              value={editableReadmeData.projectDescription} 
              onChange={(e) => handleEditableInputChange(e, 'projectDescription')}
              className="mt-1 min-h-[100px] sm:min-h-[120px] text-sm sm:text-base"
            />
          </div>
          <div>
            <Label htmlFor="edit-features" className="font-semibold text-sm sm:text-base">Features</Label>
            <Textarea 
              id="edit-features" 
              value={editableReadmeData.features} 
              onChange={(e) => handleEditableInputChange(e, 'features')}
              className="mt-1 min-h-[120px] sm:min-h-[150px] text-sm sm:text-base"
            />
          </div>
          <div>
            <Label htmlFor="edit-technologiesUsed" className="font-semibold text-sm sm:text-base">Technologies Used</Label>
            <Textarea 
              id="edit-technologiesUsed" 
              value={editableReadmeData.technologiesUsed} 
              onChange={(e) => handleEditableInputChange(e, 'technologiesUsed')}
              className="mt-1 min-h-[80px] sm:min-h-[100px] text-sm sm:text-base"
            />
          </div>
          <div>
            <Label htmlFor="edit-folderStructure" className="font-semibold text-sm sm:text-base">Folder Structure</Label>
            <Textarea 
              id="edit-folderStructure" 
              value={editableReadmeData.folderStructure} 
              onChange={(e) => handleEditableInputChange(e, 'folderStructure')}
              className="mt-1 min-h-[120px] sm:min-h-[150px] text-sm sm:text-base font-mono"
            />
          </div>
          <div>
            <Label htmlFor="edit-setupInstructions" className="font-semibold text-sm sm:text-base">Setup Instructions</Label>
            <Textarea 
              id="edit-setupInstructions" 
              value={editableReadmeData.setupInstructions} 
              onChange={(e) => handleEditableInputChange(e, 'setupInstructions')}
              className="mt-1 min-h-[150px] sm:min-h-[200px] text-sm sm:text-base"
            />
          </div>
          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-3 sm:pt-4">
            <Button variant="outline" onClick={handleCancelEdits} className="text-sm py-2 px-4 w-full sm:w-auto">
              <XCircle className="mr-1.5 h-4 w-4" /> Cancel
            </Button>
            <Button onClick={handleSaveChanges} className="text-sm py-2 px-4 bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto">
              <Save className="mr-1.5 h-4 w-4" /> Save Edits
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-3xl space-y-6 sm:space-y-8">
      <Card className="shadow-xl border hover:border-foreground transition-colors duration-200">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl md:text-3xl font-bold text-center font-headline">Generate Your README</CardTitle>
          <CardDescription className="text-center text-xs sm:text-sm md:text-base text-muted-foreground">
            Choose your input method. Generated READMEs are automatically saved. Login required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <RadioGroup
              defaultValue="url"
              onValueChange={(value: string) => {
                setInputType(value as InputType);
                setError(null);
                setPastedCode(""); 
              }}
              className="flex flex-col sm:grid sm:grid-cols-3 gap-3 sm:gap-4 mb-4 justify-center"
              aria-label="Input method"
            >
              <Label htmlFor="url-input" className={`flex items-center justify-center space-x-2 p-2 sm:p-3 border rounded-md cursor-pointer hover:bg-accent hover:text-accent-foreground ${inputType === 'url' ? 'bg-accent text-accent-foreground ring-2 ring-ring' : 'bg-background'}`}>
                <RadioGroupItem value="url" id="url-input" className="sr-only" />
                <Github className="h-4 w-4" />
                <span className="text-xs sm:text-sm">GitHub URL</span>
              </Label>
              <Label htmlFor="code-input" className={`flex items-center justify-center space-x-2 p-2 sm:p-3 border rounded-md cursor-pointer hover:bg-accent hover:text-accent-foreground ${inputType === 'code' ? 'bg-accent text-accent-foreground ring-2 ring-ring' : 'bg-background'}`}>
                <RadioGroupItem value="code" id="code-input" className="sr-only" />
                <ClipboardPaste className="h-4 w-4" />
                <span className="text-xs sm:text-sm">Paste Code</span>
              </Label>
              <Label htmlFor="prompt-input" className={`flex items-center justify-center space-x-2 p-2 sm:p-3 border rounded-md cursor-pointer hover:bg-accent hover:text-accent-foreground ${inputType === 'prompt' ? 'bg-accent text-accent-foreground ring-2 ring-ring' : 'bg-background'}`}>
                <RadioGroupItem value="prompt" id="prompt-input" className="sr-only" />
                <MessagesSquare className="h-4 w-4" />
                <span className="text-xs sm:text-sm">From Prompt</span>
              </Label>
            </RadioGroup>

            {inputType === "url" && (
              <div className="relative">
                <Github className="absolute left-3 top-1/2 -translate-y-1/2 h-4 sm:h-5 w-4 sm:h-5 text-muted-foreground" />
                <Input
                  type="url"
                  placeholder="e.g., https://github.com/username/repository"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  className="pl-10 text-sm"
                  aria-label="GitHub Repository URL"
                  disabled={isLoading || isGeneratingDetails || isEditing || isGeneratingPdf}
                />
              </div>
            )}
            {inputType === "code" && (
              <div className="relative">
                <ClipboardPaste className="absolute left-3 top-3 h-4 sm:h-5 w-4 sm:h-5 text-muted-foreground" />
                <Textarea
                  placeholder="Paste your code snippet(s) here. If pasting multiple code blocks/files, clearly separate them or add comments like // FILE: filename.js"
                  value={pastedCode}
                  onChange={(e) => setPastedCode(e.target.value)}
                  className="pl-10 text-sm min-h-[150px] sm:min-h-[200px]"
                  aria-label="Pasted Code Content"
                  disabled={isLoading || isGeneratingDetails || isEditing || isGeneratingPdf}
                />
                 <p className="mt-1 text-xs text-muted-foreground">
                    Paste one or more code snippets. The AI will analyze the combined content.
                  </p>
              </div>
            )}
            {inputType === "prompt" && (
              <div className="relative">
                 <MessagesSquare className="absolute left-3 top-3 h-4 sm:h-5 w-4 sm:h-5 text-muted-foreground" />
                <Textarea
                  placeholder="Describe your project, its purpose, key functionalities, and any specific technologies you'd like mentioned..."
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                  className="pl-10 text-sm min-h-[120px] sm:min-h-[150px]"
                  aria-label="User Prompt for README Generation"
                  disabled={isLoading || isGeneratingDetails || isEditing || isGeneratingPdf}
                />
              </div>
            )}
            <Button type="submit" className="w-full text-sm sm:text-base py-2.5 sm:py-3" disabled={isLoading || isGeneratingDetails || isEditing || isGeneratingPdf}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate README"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && !isEditing && ( 
        <Alert variant="destructive" className="shadow-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoggedIn() && getCurrentUserEmail() && savedReadmes.length > 0 && !isEditing && (
        <Card className="shadow-lg border hover:border-foreground transition-colors duration-200">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 pb-2">
            <div className="flex-1">
                <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold font-headline">Saved READMEs</CardTitle>
                <CardDescription className="text-xs sm:text-sm">View, download, or delete your previously generated READMEs. (Max 20, visible only to you)</CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="mt-2 sm:mt-0 w-full sm:w-auto text-xs px-2 py-1" disabled={isGeneratingPdf || isLoading || isGeneratingDetails || isEditing}>
                  {isGeneratingPdf ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <span dangerouslySetInnerHTML={{__html: FileTextIconSvg}} className="mr-1.5 h-3.5 w-3.5 [&_svg]:h-full [&_svg]:w-full"></span>}
                  Generate PDF
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel className="text-xs">PDF Options</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDownloadAllAsPdf} disabled={isGeneratingPdf || savedReadmes.length === 0} className="text-xs">
                  Merge All & Download
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownloadSelectedAsPdf} disabled={isGeneratingPdf || selectedReadmeIdsForPdf.length === 0} className="text-xs">
                  Download Selected
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[250px] sm:h-[300px] w-full rounded-md border p-2">
              <ul className="space-y-2 sm:space-y-3">
                {savedReadmes.map((item) => (
                  <li key={item.id} className="p-2 sm:p-3 bg-muted/50 rounded-md shadow-sm hover:bg-muted transition-colors">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                      <div className="flex items-center flex-1 min-w-0 space-x-1.5 sm:space-x-2 mb-2 sm:mb-0">
                        <Checkbox
                          id={`select-pdf-${item.id}`}
                          checked={selectedReadmeIdsForPdf.includes(item.id)}
                          onCheckedChange={(checked) => handlePdfSelectionChange(item.id, checked)}
                          aria-label={`Select ${item.projectName} for PDF export`}
                          disabled={isGeneratingPdf || isLoading || isGeneratingDetails || isEditing}
                          className="mt-0.5 sm:mt-0"
                        />
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-xs sm:text-sm text-primary truncate" title={item.projectName}>{item.projectName}</p>
                            <p className="text-xs text-muted-foreground">
                            Saved: {new Date(item.savedDate).toLocaleDateString()} {new Date(item.savedDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {item.inputTypeUsed && <span className="hidden sm:inline"> (via {item.inputTypeUsed}{item.inputTypeUsed === 'code' && item.originalInput && item.originalInput.length > 50 ? ' snippet' : ''})</span>}
                            </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 self-end sm:self-center sm:space-x-1.5 ml-auto sm:ml-2 flex-shrink-0">
                        <Button onClick={() => handleLoadReadme(item)} variant="ghost" size="sm" className="text-primary hover:text-primary/80 p-1 h-7 w-auto text-xs" title="View README" disabled={isGeneratingDetails || isLoading || isGeneratingPdf || isEditing}>
                          <Eye className="h-3.5 w-3.5" /> <span className="sr-only sm:not-sr-only sm:ml-1">View</span>
                        </Button>
                         <Button onClick={() => handleDownloadReadmeMd(item)} variant="outline" size="sm" className="p-1 h-7 w-auto text-xs" title="Download README.md" disabled={isGeneratingDetails || isLoading || isGeneratingPdf || isEditing}>
                          <Download className="h-3.5 w-3.5" /> <span className="sr-only sm:not-sr-only sm:ml-1">.MD</span>
                        </Button>
                        <Button onClick={() => handleDeleteReadme(item.id)} variant="ghost" size="sm" className="text-destructive hover:text-destructive/80 p-1 h-7 w-auto text-xs" title="Delete README" disabled={isGeneratingDetails || isLoading || isGeneratingPdf || isEditing}>
                          <Trash2 className="h-3.5 w-3.5" /> <span className="sr-only sm:not-sr-only sm:ml-1">Delete</span>
                        </Button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </ScrollArea>
             {savedReadmes.length > 0 && (
                 <p className="text-xs text-muted-foreground mt-2">
                    {selectedReadmeIdsForPdf.length} README(s) selected for PDF export. Max 20 saved.
                </p>
            )}
          </CardContent>
        </Card>
      )}

      {generatedReadmeData && !isLoading && !isEditing && (
         <div id="readme-display-card">
            <ReadmeDisplay 
              data={generatedReadmeData} 
              onGenerateDetails={handleGenerateDetails}
              isGeneratingDetails={isGeneratingDetails} 
              onEditRequest={handleEditRequest} 
            />
         </div>
      )}
    </div>
  );
}

