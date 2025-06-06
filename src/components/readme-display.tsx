
// src/components/readme-display.tsx
"use client";

import React, { useState, useEffect, useRef, ChangeEvent as ReactTextareaChangeEvent, useId } from 'react';
import type { FullReadmeData } from "@/lib/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import {
  Check, Edit3, Maximize, Minimize, Loader2, Eye, Palette, ImagePlus, CircleX, DownloadCloud,
  FileText, ClipboardCopy, Code, QrCode, Type, Save, Columns, ImageUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { QRCodeSVG } from 'qrcode.react';
import ReactMarkdown from 'react-markdown';
import RemarkGfm from 'remark-gfm';


interface ReadmeDisplayProps {
  data: FullReadmeData;
  onGenerateDetails: (currentData: FullReadmeData) => Promise<void>;
  isGeneratingDetails: boolean;
  onEditRequest: () => void; // This might be less used now, or repurposed.
}

type IconName = keyof typeof LUCIDE_ICON_MAP;

const LUCIDE_ICON_MAP = {
  Edit3, Pencil: Edit3, Edit2: Edit3, Edit: Edit3,
  FileText, FileJson: FileText, FileCode2: FileText, FileArchive: FileText,
  ClipboardCopy, Copy: ClipboardCopy, Clipboard: ClipboardCopy, CopyCheck: Check,
  Code, Code2: Code, Terminal: Code,
  Eye, EyeOff: Eye, View: Eye,
  Palette, Paintbrush: Palette, Brush: Palette,
  ImagePlus, Image: ImagePlus, FileImage: ImagePlus, ImageUp,
  Maximize, ExternalLink: Maximize, Expand: Maximize,
  Minimize, Shrink: Minimize, Minimize2: Minimize,
  DownloadCloud, Download: DownloadCloud, CloudDownload: DownloadCloud,
  QrCode, QrCodeIcon: QrCode, // Added for QR Code
  Type, Heading1: Type, Pilcrow: Type, // Added for Font
  Save, CheckSquare: Save, // Added for potential future Save Raw button
  Columns, LayoutGrid: Columns, Rows: Columns, // Added for Edit Raw button
};

interface IconOption {
  value: IconName;
  label: string;
}

interface CustomizableAction {
  id: keyof ActionButtonIcons;
  label: string;
  defaultIcon: IconName;
  options: IconOption[];
}

interface ActionButtonIcons {
  edit: IconName;
  moreDetail: IconName;
  copy: IconName;
  toggleLiveEdit: IconName; // Replaces viewRaw / viewFormatted
  branding: IconName;
  fullScreen: IconName;
  exitFullScreen: IconName;
  qr: IconName;
  font: IconName;
  // saveRaw: IconName; // For future "Save Raw Changes" button
}

const DEFAULT_ACTION_BUTTON_ICONS: ActionButtonIcons = {
  edit: 'Edit3',
  moreDetail: 'FileText',
  copy: 'ClipboardCopy',
  toggleLiveEdit: 'Columns', // New default for toggling editor
  branding: 'Palette',
  fullScreen: 'Maximize',
  exitFullScreen: 'Minimize',
  qr: 'QrCode',
  font: 'Type',
  // saveRaw: 'Save',
};

const CUSTOMIZABLE_ACTIONS: CustomizableAction[] = [
  { id: 'edit', label: 'Structured Edit Button', defaultIcon: 'Edit3', options: [{value: 'Edit3', label: 'Edit 3'}, {value: 'Pencil', label: 'Pencil'}, {value: 'Edit2', label: 'Edit 2'}] },
  { id: 'moreDetail', label: 'More Detail Button', defaultIcon: 'FileText', options: [{value: 'FileText', label: 'File Text'}, {value: 'FileJson', label: 'File JSON'}, {value: 'FileCode2', label: 'File Code 2'}] },
  { id: 'copy', label: 'Copy All Button', defaultIcon: 'ClipboardCopy', options: [{value: 'ClipboardCopy', label: 'Clipboard Copy'}, {value: 'Copy', label: 'Copy'}, {value: 'Clipboard', label: 'Clipboard'}] },
  { id: 'toggleLiveEdit', label: 'Edit Raw / Preview Button', defaultIcon: 'Columns', options: [{value: 'Columns', label: 'Columns (Edit/Preview)'}, {value: 'Code', label: 'Code (Raw)'}, {value: 'Eye', label: 'Eye (Preview)'}] },
  { id: 'branding', label: 'Branding Button', defaultIcon: 'Palette', options: [{value: 'Palette', label: 'Palette'}, {value: 'Paintbrush', label: 'Paintbrush'}, {value: 'Image', label: 'Image'}] },
  { id: 'fullScreen', label: 'Full Screen Button', defaultIcon: 'Maximize', options: [{value: 'Maximize', label: 'Maximize'}, {value: 'Expand', label: 'Expand'}] },
  { id: 'exitFullScreen', label: 'Exit Full Screen Button', defaultIcon: 'Minimize', options: [{value: 'Minimize', label: 'Minimize'}, {value: 'Shrink', label: 'Shrink'}] },
  { id: 'qr', label: 'QR Code Button', defaultIcon: 'QrCode', options: [{value: 'QrCode', label: 'QR Code Default'}] },
  { id: 'font', label: 'Font Select Icon', defaultIcon: 'Type', options: [{value: 'Type', label: 'Type Default'}, {value: 'Heading1', label: 'Heading 1'}] },
  // { id: 'saveRaw', label: 'Save Raw Changes Button', defaultIcon: 'Save', options: [{value: 'Save', label: 'Save'}, {value: 'CheckSquare', label: 'Check Square'}] },
];

const FONT_OPTIONS = [
  { value: 'Inter, sans-serif', label: 'Inter (Default)' },
  { value: 'Arial, Helvetica, sans-serif', label: 'Arial' },
  { value: 'Helvetica, Arial, sans-serif', label: 'Helvetica' },
  { value: '"Times New Roman", Times, serif', label: 'Times New Roman' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: '"Courier New", Courier, monospace', label: 'Courier New' },
  { value: 'Verdana, Geneva, sans-serif', label: 'Verdana' },
];

const MAX_QR_CODE_DATA_LENGTH = 2000; // Conservative limit for QR data URI

export function ReadmeDisplay({ data: initialData, onGenerateDetails, isGeneratingDetails, onEditRequest }: ReadmeDisplayProps) {
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const contentWrapperId = `readme-content-wrapper-${useId()}`;

  const [customLogoDataUri, setCustomLogoDataUri] = useState<string | null>(null);
  const [selectedThemeColor, setSelectedThemeColor] = useState<string>("#3b82f6"); // Default to a nice blue
  const [isBrandingDialogOpen, setIsBrandingDialogOpen] = useState<boolean>(false);
  const [isGeneratingBrandedPdf, setIsGeneratingBrandedPdf] = useState<boolean>(false);

  const [qrCodeValue, setQrCodeValue] = useState<string>('');
  const [isQrDialogOpen, setIsQrDialogOpen] = useState<boolean>(false);

  const [selectedFontFamily, setSelectedFontFamily] = useState<string>(FONT_OPTIONS[0].value);
  const [actionButtonIcons, setActionButtonIcons] = useState<ActionButtonIcons>(DEFAULT_ACTION_BUTTON_ICONS);
  const [isIconOptionsDialogOpen, setIsIconOptionsDialogOpen] = useState<boolean>(false);
  
  const [isCopiedGlobal, setIsCopiedGlobal] = useState(false); // For the main "Copy All" button

  const [rawMarkdownContent, setRawMarkdownContent] = useState<string>('');
  const [isLiveEditing, setIsLiveEditing] = useState<boolean>(false);
  const editorTextAreaRef = useRef<HTMLTextAreaElement>(null);

  const formatReadmeForMarkdown = (readmeData: FullReadmeData): string => {
    if (!readmeData) return '';
    let text = `# ${readmeData.projectName}\n\n`;
    text += `## Project Description\n${readmeData.projectDescription}\n\n`;
    text += `## Features\n${readmeData.features}\n\n`;
    text += `## Technologies Used\n${readmeData.technologiesUsed}\n\n`;
    text += `## Folder Structure\n\`\`\`\n${readmeData.folderStructure}\n\`\`\`\n\n`;
    text += `## Setup Instructions\n${readmeData.setupInstructions}\n`;
    return text.trim();
  };

  useEffect(() => {
    setMounted(true);
    const storedFont = localStorage.getItem('readmeDisplayFont');
    if (storedFont && FONT_OPTIONS.find(f => f.value === storedFont)) {
      setSelectedFontFamily(storedFont);
    }
    const storedIcons = localStorage.getItem('readmeDisplayIcons');
    if (storedIcons) {
      try {
        setActionButtonIcons(JSON.parse(storedIcons));
      } catch (e) {
        localStorage.removeItem('readmeDisplayIcons'); // Clear corrupted data
      }
    }
  }, []);
  
  useEffect(() => {
    if (initialData) {
      setRawMarkdownContent(formatReadmeForMarkdown(initialData));
    }
  }, [initialData]);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('readmeDisplayFont', selectedFontFamily);
    }
  }, [selectedFontFamily, mounted]);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('readmeDisplayIcons', JSON.stringify(actionButtonIcons));
    }
  }, [actionButtonIcons, mounted]);


  useEffect(() => {
    if (!mounted) return;
    const handleEsc = (event: KeyboardEvent) => { if (event.key === 'Escape' && isFullScreen) setIsFullScreen(false); };
    if (isFullScreen) { document.body.style.overflow = 'hidden'; document.addEventListener('keydown', handleEsc); }
    else { document.body.style.overflow = ''; }
    return () => { document.body.style.overflow = ''; document.removeEventListener('keydown', handleEsc); };
  }, [isFullScreen, mounted]);


  const handleGlobalCopy = () => {
    if (!mounted) return;
    navigator.clipboard.writeText(rawMarkdownContent)
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

  const readmeToBrandedHtml = (
    readmeMd: string, // Now takes raw Markdown
    logoUri: string | null,
    themeColorHex: string
  ): string => {
    // This function would ideally use react-markdown to render to a temporary element,
    // then capture its innerHTML, and then inject logo and theme colors.
    // For simplicity in this step, we'll do a very basic HTML structure.
    // A more robust solution would involve a server-side rendering or more complex client-side HTML construction.

    let html = `<div style="font-family: ${selectedFontFamily}; padding: 20px; max-width: 800px; margin: auto; border: 1px solid #ddd; color: #333;">`;
    if (logoUri) {
      html += `<div style="text-align: center; margin-bottom: 25px;"><img src="${logoUri}" alt="Custom Logo" style="max-height: 80px; max-width: 200px; display: inline-block;" /></div>`;
    }
    // Extract project name from Markdown (first H1)
    const projectNameMatch = readmeMd.match(/^# (.*)/m);
    const projectName = projectNameMatch ? projectNameMatch[1] : 'README Document';
    html += `<h1 style="font-size: 26px; color: ${themeColorHex}; border-bottom: 2px solid ${themeColorHex}; padding-bottom: 8px; margin-bottom: 20px; text-align: center;">${projectName}</h1>`;
    
    // Convert Markdown to HTML (very basic for PDF)
    // In a real scenario, you'd use react-markdown here on a temp div then get innerHTML
    // Or use a library that converts MD to HTML string with GFM.
    // This is a placeholder for proper MD to HTML conversion for PDF.
    const bodyHtml = readmeMd
        .replace(/^## (.*)/gm, `<h2 style="font-size: 20px; color: ${themeColorHex}; margin-top: 20px; margin-bottom: 10px; border-bottom: 1px solid ${themeColorHex}; padding-bottom: 4px;">$1</h2>`)
        .replace(/^### (.*)/gm, `<h3 style="font-size: 16px; color: ${themeColorHex}; margin-top: 15px; margin-bottom: 5px;">$1</h3>`)
        .replace(/\n/g, '<br />') // Basic newline to <br>
        .replace(/```([\s\S]*?)```/g, (match, code) => `<pre style="background-color: #f0f0f0; border: 1px solid #ccc; padding: 10px; border-radius: 5px; font-size: 12px; white-space: pre-wrap; word-wrap: break-word; color: #444;">${code.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>`)
        .replace(/`([^`]+)`/g, `<code style="background-color: #eee; padding: 2px 4px; border-radius: 3px; font-family: monospace;">$1</code>`);


    html += `<div class="prose prose-sm">${bodyHtml.replace(/^# .*/m, '')}</div>`; // Add prose for basic styling, skip H1
    
    html += `</div>`;
    return html;
  };

  const handleDownloadBrandedPdf = async () => {
    if (!mounted || !rawMarkdownContent) return;
    setIsGeneratingBrandedPdf(true);
    toast({ title: "Generating Branded PDF...", description: "This may take a moment." });
    try {
      const brandedHtml = readmeToBrandedHtml(rawMarkdownContent, customLogoDataUri, selectedThemeColor);
      const pdfContainer = document.createElement('div');
      pdfContainer.style.position = 'absolute'; pdfContainer.style.left = '-9999px'; pdfContainer.style.width = '800px';
      pdfContainer.innerHTML = brandedHtml;
      document.body.appendChild(pdfContainer);

      const canvas = await html2canvas(pdfContainer, { scale: 2, useCORS: true, logging: false, width: pdfContainer.scrollWidth, height: pdfContainer.scrollHeight, windowWidth: pdfContainer.scrollWidth, windowHeight: pdfContainer.scrollHeight });
      document.body.removeChild(pdfContainer);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'p', unit: 'px', format: [canvas.width, canvas.height] });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      const projectNameMatch = rawMarkdownContent.match(/^# (.*)/m);
      const sanitizedProjectName = projectNameMatch ? projectNameMatch[1].replace(/[^a-z0-9_]/gi, '_').toLowerCase() : 'readme';
      pdf.save(`${sanitizedProjectName}_branded.pdf`);
      toast({ title: "Branded PDF Generated!", description: "Your branded PDF has been downloaded." });
    } catch (e: any) {
      console.error("Branded PDF Generation Error:", e);
      toast({ title: "PDF Generation Failed", description: e.message || "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsGeneratingBrandedPdf(false);
      setIsBrandingDialogOpen(false);
    }
  };

  const handleGenerateQrCode = () => {
    if (!mounted) return;
    const dataUri = `data:text/markdown;charset=utf-8,${encodeURIComponent(rawMarkdownContent)}`;
    if (dataUri.length > MAX_QR_CODE_DATA_LENGTH) {
      toast({
        title: "README Too Large for QR Code",
        description: "The content is too long to reliably generate a QR code. Please copy content manually.",
        variant: "destructive",
        duration: 7000,
      });
      setQrCodeValue(''); // Clear previous value if any
      setIsQrDialogOpen(false); // Don't open dialog
      return;
    }
    setQrCodeValue(dataUri);
    setIsQrDialogOpen(true);
  };
  
  const handleLogoUpload = (event: ReactTextareaChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => { setCustomLogoDataUri(reader.result as string); };
      reader.readAsDataURL(file);
    } else if (file) {
      toast({ title: "Invalid File", description: "Please upload an image file.", variant: "destructive" });
    }
  };

  const handleMoreDetailClick = () => { if (!mounted || !initialData) return; onGenerateDetails(initialData); }; // Operates on original structured data
  
  const toggleFullScreen = () => { if (!mounted) return; setIsFullScreen(!isFullScreen); };

  const getIcon = (iconName: IconName | undefined) => {
    const IconComponent = LUCIDE_ICON_MAP[iconName || 'Edit3']; // Fallback to Edit3 if undefined
    return <IconComponent />;
  };

  const handleToggleLiveEdit = () => {
    setIsLiveEditing(prev => !prev);
    if (!isLiveEditing && initialData) { // Entering edit mode
      setRawMarkdownContent(formatReadmeForMarkdown(initialData));
    }
    // Note: No saving of rawMarkdownContent back to initialData when toggling off.
    // This would require a "Save Raw Changes" button and more complex logic.
  };

  if (!mounted || !initialData) return (
    <Card className="w-full shadow-xl animate-pulse">
        <CardHeader>
            <div className="h-8 bg-muted rounded w-3/4"></div>
        </CardHeader>
        <CardContent>
            <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="space-y-2">
                        <div className="h-6 bg-muted rounded w-1/4"></div>
                        <div className="h-10 bg-muted rounded w-full"></div>
                    </div>
                ))}
            </div>
        </CardContent>
    </Card>
  );

  const EditIconToRender = getIcon(actionButtonIcons.edit);
  const MoreDetailIconToRender = getIcon(actionButtonIcons.moreDetail);
  const CopyIconToRender = isCopiedGlobal ? <Check /> : getIcon(actionButtonIcons.copy);
  const ToggleLiveEditIconToRender = getIcon(actionButtonIcons.toggleLiveEdit);
  const BrandingIconToRender = getIcon(actionButtonIcons.branding);
  const FullScreenIconToRender = isFullScreen ? getIcon(actionButtonIcons.exitFullScreen) : getIcon(actionButtonIcons.fullScreen);
  const QRIconToRender = getIcon(actionButtonIcons.qr);
  const FontIconToRender = getIcon(actionButtonIcons.font);


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
          {isFullScreen && !isLiveEditing ? initialData.projectName : "Generated README.md"}
          {isFullScreen && isLiveEditing ? " (Live Editor)" : ""}
        </CardTitle>
        <div className={cn(
            "flex items-center flex-wrap w-full sm:w-auto",
            "gap-1 sm:gap-1.5 justify-start", // Reduced gap slightly
            "sm:justify-end mt-2 sm:mt-0"
          )}>
           <Button variant="outline" size="sm" onClick={() => onEditRequest()} className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-2 py-1 sm:text-sm sm:px-2.5 sm:py-1" title="Edit Structured Data">
            <span className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5">{EditIconToRender}</span> Edit Sections
          </Button>
          <Button variant="outline" size="sm" onClick={handleMoreDetailClick} disabled={isGeneratingDetails || isLiveEditing} className="bg-secondary text-secondary-foreground hover:bg-secondary/80 text-xs px-2 py-1 sm:text-sm sm:px-2.5 sm:py-1" title={isLiveEditing ? "Disabled in live edit mode" : "Generate More Detail"}>
            {isGeneratingDetails ? <Loader2 className="mr-1 h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" /> : <span className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5">{MoreDetailIconToRender}</span>}
            {isGeneratingDetails ? "Generating..." : "More Detail"}
          </Button>
          <Button variant="outline" size="sm" onClick={handleToggleLiveEdit} className="bg-purple-500 hover:bg-purple-600 text-white text-xs px-2 py-1 sm:text-sm sm:px-2.5 sm:py-1" title={isLiveEditing ? "View Formatted Preview" : "Edit Raw Markdown"}>
             <span className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5">{ToggleLiveEditIconToRender}</span>
            {isLiveEditing ? 'Preview' : 'Edit Raw'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleGlobalCopy} className="bg-accent text-accent-foreground hover:bg-accent/90 text-xs px-2 py-1 sm:text-sm sm:px-2.5 sm:py-1" title="Copy All Markdown">
            <span className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5">{CopyIconToRender}</span>
            {isCopiedGlobal ? "Copied!" : "Copy All"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsBrandingDialogOpen(true)} className="bg-orange-500 hover:bg-orange-600 text-white text-xs px-2 py-1 sm:text-sm sm:px-2.5 sm:py-1" title="Custom Branding & PDF Export">
             <span className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5">{BrandingIconToRender}</span>
            Branding
          </Button>
          <Select value={selectedFontFamily} onValueChange={setSelectedFontFamily}>
            <SelectTrigger className="h-auto w-auto text-xs px-2 py-1 sm:text-sm sm:px-2.5 sm:py-1 bg-muted text-muted-foreground hover:bg-muted/80" title="Change Font Style">
               <span className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5">{FontIconToRender}</span>
              <SelectValue placeholder="Font" />
            </SelectTrigger>
            <SelectContent>
              {FONT_OPTIONS.map(font => (
                <SelectItem key={font.value} value={font.value} style={{fontFamily: font.value}} className="text-xs sm:text-sm">
                  {font.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
           <Button variant="outline" size="sm" onClick={handleGenerateQrCode} className="bg-teal-500 hover:bg-teal-600 text-white text-xs px-2 py-1 sm:text-sm sm:px-2.5 sm:py-1" title="Generate QR Code to Share/Download">
             <span className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5">{QRIconToRender}</span>
            QR
          </Button>
           <Button variant="outline" size="sm" onClick={() => setIsIconOptionsDialogOpen(true)} className="bg-indigo-500 hover:bg-indigo-600 text-white text-xs px-2 py-1 sm:text-sm sm:px-2.5 sm:py-1" title="Customize Button Icons">
            <ImagePlus className="mr-1 h-3.5 w-3.5 sm:h-4 sm:w-4" /> Icons
          </Button>
          <Button variant="outline" size="sm" onClick={toggleFullScreen} className="bg-gray-500 hover:bg-gray-600 text-white text-xs px-2 py-1 sm:text-sm sm:px-2.5 sm:py-1" title={isFullScreen ? "Exit Full Screen" : "Enter Full Screen"}>
             <span className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5">{FullScreenIconToRender}</span>
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
          <div className={cn(
              isLiveEditing ? "md:grid md:grid-cols-2 md:gap-0 h-full" : "h-full",
              isFullScreen ? "max-w-none mx-0" : "max-w-4xl mx-auto",
              isFullScreen && isLiveEditing ? "md:gap-0" : "p-0 md:p-1"
            )}>
            {isLiveEditing && (
              <div className={cn(
                "w-full h-full p-1",
                isFullScreen ? "md:border-r md:border-border" : "border rounded-md md:rounded-l-md md:rounded-r-none"
              )}>
                <Textarea
                  ref={editorTextAreaRef}
                  value={rawMarkdownContent}
                  onChange={(e) => setRawMarkdownContent(e.target.value)}
                  className={cn(
                    "w-full h-full min-h-[300px] md:min-h-full resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-2 font-mono text-xs sm:text-sm",
                    isFullScreen ? "rounded-none" : "rounded-md md:rounded-l-md md:rounded-r-none"
                  )}
                  placeholder="Edit your README.md content here..."
                  style={{fontFamily: FONT_OPTIONS.find(f => f.label.includes('Courier New'))?.value }}
                />
              </div>
            )}
            
            {(!isLiveEditing || (isLiveEditing && typeof window !== 'undefined' && window.innerWidth >= 768)) && (
               <div className={cn(
                  "prose prose-sm sm:prose-base dark:prose-invert max-w-none overflow-auto",
                  "p-3 sm:p-4",
                   isLiveEditing ? (isFullScreen ? "md:border-l-0" : "border rounded-md md:rounded-r-md md:rounded-l-none") : "",
                   isFullScreen ? "h-full" : ""
                  )}
                  style={{ fontFamily: selectedFontFamily }}
                  id={contentWrapperId}
                >
                <ReactMarkdown remarkPlugins={[RemarkGfm]}>
                  {rawMarkdownContent}
                </ReactMarkdown>
              </div>
            )}
             {isLiveEditing && typeof window !== 'undefined' && window.innerWidth < 768 && (
                <div className="p-2 text-center text-muted-foreground text-xs">
                    Preview is hidden on small screens in edit mode. Toggle "Preview" to see changes.
                </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>

    {/* Branding Dialog */}
    <Dialog open={isBrandingDialogOpen} onOpenChange={setIsBrandingDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {getIcon(actionButtonIcons.branding)} Custom Branding & Export
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
                    placeholder="#3b82f6"
                    className="h-10 flex-1 text-sm"
                    disabled={isGeneratingBrandedPdf}
                />
              </div>
            </div>
          </div>
          <DialogFooter className="sm:justify-end gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isGeneratingBrandedPdf}>Close</Button>
            </DialogClose>
            <Button type="button" onClick={handleDownloadBrandedPdf} disabled={isGeneratingBrandedPdf || !rawMarkdownContent}>
              {isGeneratingBrandedPdf ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <DownloadCloud className="mr-2 h-4 w-4" /> }
              Download Branded PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* QR Code Dialog */}
       <Dialog open={isQrDialogOpen} onOpenChange={setIsQrDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {getIcon(actionButtonIcons.qr)} Scan to View/Download README
            </DialogTitle>
            <DialogDescription>
              Scan this QR code with another device. You'll get the raw Markdown text.
              Copy the text and save it as an `README.md` file on that device.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-4">
            {qrCodeValue ? (
              <QRCodeSVG value={qrCodeValue} size={256} includeMargin={true} level="L" imageSettings={{excavate:true, height:40, width:40, src:"/qr_logo.png"}}/>
            ) : (
              <p className="text-muted-foreground">QR code not available (content might be too large or empty).</p>
            )}
          </div>
           <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Icon Options Dialog */}
       <Dialog open={isIconOptionsDialogOpen} onOpenChange={setIsIconOptionsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><ImagePlus /> Customize Button Icons</DialogTitle>
            <DialogDescription>Select your preferred icons for various actions.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] p-1 -mx-1">
            <div className="space-y-4 py-4 pr-3">
              {CUSTOMIZABLE_ACTIONS.map(action => (
                <div key={action.id} className="space-y-1.5">
                  <Label htmlFor={`icon-select-${action.id}`} className="text-sm font-medium">{action.label}</Label>
                  <Select
                    value={actionButtonIcons[action.id]}
                    onValueChange={(value) => {
                      setActionButtonIcons(prev => ({ ...prev, [action.id]: value as IconName }));
                    }}
                  >
                    <SelectTrigger id={`icon-select-${action.id}`} className="w-full text-xs sm:text-sm">
                      <SelectValue placeholder="Select an icon" />
                    </SelectTrigger>
                    <SelectContent>
                      {action.options.map(option => (
                        <SelectItem key={option.value} value={option.value} className="text-xs sm:text-sm">
                          <div className="flex items-center gap-2">
                            {React.createElement(LUCIDE_ICON_MAP[option.value], {className: "h-4 w-4"})}
                            {option.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </ScrollArea>
          <DialogFooter className="mt-2 flex-col sm:flex-row sm:justify-between">
            <Button variant="ghost" onClick={() => {setActionButtonIcons(DEFAULT_ACTION_BUTTON_ICONS); toast({title: "Icons Reset", description: "Button icons restored to defaults."})}} className="w-full sm:w-auto text-xs">Reset to Defaults</Button>
            <div className="flex gap-2 w-full sm:w-auto">
            <DialogClose asChild><Button type="button" variant="outline" className="flex-1 sm:flex-none text-xs">Close</Button></DialogClose>
            <Button type="button" onClick={() => {setIsIconOptionsDialogOpen(false); toast({title: "Preferences Saved", description: "Icon choices have been updated."})}} className="flex-1 sm:flex-none text-xs">Save Preferences</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
