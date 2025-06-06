
"use client";

import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, AlertTriangle, Sparkles, Wand2 } from "lucide-react";
import { explainCodeAction } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { isLoggedIn } from "@/lib/auth/storage";
import { useRouter } from "next/navigation";

type ExplanationLevel = "beginner" | "technical";

export function CodeExplainer() {
  const [codeToExplain, setCodeToExplain] = useState<string>("");
  const [explanationLevel, setExplanationLevel] = useState<ExplanationLevel>("beginner");
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async () => {
    if (!mounted) return;

    if (!isLoggedIn()) {
      toast({
        title: "Authentication Required",
        description: "Please log in to use the code explanation feature.",
        variant: "destructive",
      });
      router.push('/auth/login');
      return;
    }

    if (!codeToExplain.trim()) {
      setError("Please enter some code to explain.");
      toast({ title: "Input Required", description: "Code snippet cannot be empty.", variant: "destructive" });
      return;
    }

    setError(null);
    setExplanation(null);
    setIsLoading(true);

    try {
      const result = await explainCodeAction(codeToExplain, explanationLevel);
      if (result.error) {
        setError(result.error);
        toast({ title: "Explanation Failed", description: result.error, variant: "destructive" });
      } else if (result.explanation) {
        setExplanation(result.explanation);
        toast({ title: "Explanation Generated!", description: "The AI has explained your code." });
      } else {
        setError("Failed to get an explanation. The AI might not have provided a response.");
        toast({ title: "Explanation Failed", description: "No explanation received from AI.", variant: "destructive" });
      }
    } catch (e: any) {
      setError(e.message || "An unexpected error occurred.");
      toast({ title: "Error", description: e.message || "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) {
    return (
      <Card className="w-full shadow-xl animate-pulse">
        <CardHeader>
          <div className="h-7 bg-muted rounded-md w-3/4 mx-auto"></div>
          <div className="h-4 bg-muted rounded-md w-full mx-auto mt-2"></div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="h-5 bg-muted rounded-md w-1/4 mb-2"></div>
            <div className="h-32 bg-muted rounded-md"></div>
          </div>
          <div>
            <div className="h-5 bg-muted rounded-md w-1/4 mb-2"></div>
            <div className="flex space-x-4">
              <div className="h-10 bg-muted rounded-md flex-1"></div>
              <div className="h-10 bg-muted rounded-md flex-1"></div>
            </div>
          </div>
          <div className="h-12 bg-muted rounded-md w-full"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-xl border hover:border-foreground transition-colors duration-200">
      <CardHeader className="items-center">
        <CardTitle className="text-xl sm:text-2xl md:text-3xl font-bold text-center font-headline flex items-center gap-2">
          <Wand2 className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
          AI Code Explainer
        </CardTitle>
        <CardDescription className="text-center text-xs sm:text-sm md:text-base text-muted-foreground">
          Paste your code, choose an explanation level, and let AI break it down for you.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6">
        <div>
          <Label htmlFor="code-input-area" className="text-sm font-medium">Your Code Snippet</Label>
          <Textarea
            id="code-input-area"
            placeholder="Enter or paste your code here..."
            value={codeToExplain}
            onChange={(e) => setCodeToExplain(e.target.value)}
            className="mt-1.5 font-mono text-xs sm:text-sm min-h-[150px] sm:min-h-[200px] lg:min-h-[250px] p-3 focus:ring-2 focus:ring-ring"
            aria-label="Code input area"
            disabled={isLoading}
          />
        </div>

        <div>
          <Label className="text-sm font-medium">Explanation Level</Label>
          <RadioGroup
            defaultValue="beginner"
            value={explanationLevel}
            onValueChange={(value: string) => setExplanationLevel(value as ExplanationLevel)}
            className="mt-1.5 grid grid-cols-1 sm:grid-cols-2 gap-3"
            aria-label="Explanation level"
            disabled={isLoading}
          >
            <Label htmlFor="level-beginner" className={`flex items-center space-x-2 p-3 border rounded-md cursor-pointer hover:bg-accent hover:text-accent-foreground ${explanationLevel === 'beginner' ? 'bg-accent text-accent-foreground ring-2 ring-ring' : 'bg-background'}`}>
              <RadioGroupItem value="beginner" id="level-beginner" />
              <span>Beginner-Friendly</span>
            </Label>
            <Label htmlFor="level-technical" className={`flex items-center space-x-2 p-3 border rounded-md cursor-pointer hover:bg-accent hover:text-accent-foreground ${explanationLevel === 'technical' ? 'bg-accent text-accent-foreground ring-2 ring-ring' : 'bg-background'}`}>
              <RadioGroupItem value="technical" id="level-technical" />
              <span>Technical</span>
            </Label>
          </RadioGroup>
        </div>

        <Button onClick={handleSubmit} className="w-full text-sm sm:text-base py-2.5 sm:py-3" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Explaining...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Explain Code
            </>
          )}
        </Button>

        {error && (
          <Alert variant="destructive" className="shadow-sm">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {explanation && !isLoading && (
          <Card className="mt-4 sm:mt-6 border bg-muted/30 shadow-inner">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-base sm:text-lg font-semibold text-primary">AI Explanation ({explanationLevel})</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <ScrollArea className="h-[200px] sm:h-[250px] lg:h-[300px] w-full rounded-md border bg-background p-3 shadow-sm">
                <pre className="whitespace-pre-wrap text-xs sm:text-sm leading-relaxed font-sans">
                  {explanation}
                </pre>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
