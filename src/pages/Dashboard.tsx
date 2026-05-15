import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ResumeUpload from "@/components/ResumeUpload";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { analyzeCareerProfile } from "@/lib/geminiService";
import * as pdfjs from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Use local bundled worker to avoid CDN/version/network mismatches.
  pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

  const extractTextFromFile = async (file: File): Promise<string> => {
    if (file.type === "text/plain" || file.name.endsWith(".txt")) {
      return file.text();
    }

    // PDF parsing with pdfjs-dist
    if (file.name.endsWith(".pdf")) {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument(arrayBuffer).promise;
      let text = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        text +=
          textContent.items
            .map((item) => ("str" in item ? String(item.str) : ""))
            .join(" ") + "\n";
      }

      return text;
    }

    throw new Error("Unsupported file type. Please upload PDF or TXT files only.");
  };

  const handleAnalyze = async () => {
    if (!file) {
      toast({
        title: "Resume required",
        description: "Please upload your resume to start the analysis.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 5MB. Please compress your resume.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const resumeText = await extractTextFromFile(file);

      const analysis = await analyzeCareerProfile({
        resumeText,
        jobDescription,
        githubUrl,
        linkedinUrl,
      });

      localStorage.setItem("careerforge:last-analysis", JSON.stringify(analysis));
      navigate("/results", { state: { analysis } });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Analysis failed";
      toast({ title: "Analysis failed", description: message, variant: "destructive" });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60 px-6 md:px-8 py-5 flex justify-between items-center bg-background/90 backdrop-blur-xl sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="text-dim hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="text-xl font-serif font-medium tracking-tight text-primary italic">
            CareerForge.
          </span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 md:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="font-serif text-3xl md:text-4xl font-medium mb-2">New Analysis</h1>
          <p className="text-dim text-sm mb-10 max-w-[55ch]">
            Upload your resume and provide the target job description. Our AI engine will evaluate
            alignment, detect your experience level, and generate actionable recommendations.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col gap-6"
          >
            <div>
              <label className="text-[10px] font-semibold tracking-widest text-dim uppercase mb-3 block">
                Resume / CV
              </label>
              <ResumeUpload
                file={file}
                onFileSelect={setFile}
                onError={(message) =>
                  toast({ title: "Invalid file", description: message, variant: "destructive" })
                }
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold tracking-widest text-dim uppercase mb-3 block">
                Target Job Description
              </label>
              <Textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the full job description here..."
                className="min-h-[180px] bg-background border-border text-foreground placeholder:text-muted-foreground resize-none focus-visible:ring-primary/30"
              />
            </div>
          </motion.div>

          {/* Right Column */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col gap-6"
          >
            <div>
              <label className="text-[10px] font-semibold tracking-widest text-dim uppercase mb-3 flex items-center gap-2">
                <ExternalLink className="w-3 h-3" /> GitHub Profile URL
              </label>
              <Input
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/username"
                className="bg-background border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/30"
              />
              <p className="text-[11px] text-dim mt-2">
                Used to verify technical claims and extract skill data.
              </p>
            </div>
            <div>
              <label className="text-[10px] font-semibold tracking-widest text-dim uppercase mb-3 flex items-center gap-2">
                <ExternalLink className="w-3 h-3" /> LinkedIn Profile URL
              </label>
              <Input
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/in/username"
                className="bg-background border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/30"
              />
              <p className="text-[11px] text-dim mt-2">
                Cross-references experience claims for integrity analysis.
              </p>
            </div>

            {/* Readiness Card */}
            <div className="bg-card border border-border p-5 rounded-sm mt-auto">
              <div className="text-[10px] font-semibold tracking-widest text-dim uppercase mb-3">
                Analysis Readiness
              </div>
              <div className="flex flex-col gap-2">
                {[
                  { label: "Resume", ready: !!file },
                  { label: "Job Description", ready: jobDescription.length > 50 },
                  { label: "GitHub Profile", ready: githubUrl.includes("github.com") },
                  { label: "LinkedIn Profile", ready: linkedinUrl.includes("linkedin.com") },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between text-sm">
                    <span className="text-dim">{item.label}</span>
                    <span
                      className={`text-[10px] uppercase tracking-widest font-semibold ${
                        item.ready ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      {item.ready ? "Ready" : "Pending"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Analyze Button */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10"
        >
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="w-full bg-primary text-primary-foreground px-8 py-4 text-sm font-semibold uppercase tracking-[0.15em] hover:opacity-90 transition-all shadow-[var(--shadow-warm)] rounded-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isAnalyzing ? (
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Analyzing...
                </div>
                <span className="text-[10px] tracking-widest opacity-70 normal-case">
                  AI is cross-referencing your GitHub and Resume...
                </span>
              </div>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Run Career Analysis
              </>
            )}
          </button>
        </motion.div>
      </main>
    </div>
  );
};

export default Dashboard;
