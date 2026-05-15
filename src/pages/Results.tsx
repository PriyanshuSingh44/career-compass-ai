import { motion } from "framer-motion";
import {
  ArrowLeft,
  Copy,
  Check,
  ExternalLink,
  Shield,
  AlertTriangle,
  BookOpen,
  Code2,
  Search,
  AlertCircle,
  Download,
  Loader2,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import TechnicalIntegrityCard from "@/components/TechnicalIntegrityCard";
import { AnalysisResult } from "@/types/analysis";

const ScoreRing = ({ score }: { score: number }) => {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color =
    score >= 70 ? "hsl(var(--primary))" : score >= 40 ? "hsl(38 70% 50%)" : "hsl(var(--destructive))";

  return (
    <div className="relative flex items-center justify-center">
      <svg width="150" height="150" className="-rotate-90">
        <circle cx="75" cy="75" r={radius} fill="none" stroke="hsl(var(--border))" strokeWidth="6" />
        <motion.circle
          cx="75"
          cy="75"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-4xl font-serif text-foreground">{score}</span>
        <span className="text-[10px] uppercase tracking-widest text-dim font-semibold">Score</span>
      </div>
    </div>
  );
};

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="text-dim hover:text-primary transition-colors p-1"
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
};

const SeverityBadge = ({ severity }: { severity: string }) => {
  const colors: Record<string, string> = {
    high: "bg-destructive/10 text-destructive border-destructive/30",
    medium: "bg-primary/10 text-primary border-primary/30",
    low: "bg-muted text-dim border-border",
  };
  return (
    <span
      className={`text-[10px] uppercase tracking-widest font-semibold px-2 py-0.5 border rounded-sm ${
        colors[severity] || colors.low
      }`}
    >
      {severity}
    </span>
  );
};

const Results = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const cachedAnalysis = localStorage.getItem("careerforge:last-analysis");
  const initialAnalysis: AnalysisResult | null =
    location.state?.analysis ?? (cachedAnalysis ? (JSON.parse(cachedAnalysis) as AnalysisResult) : null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(initialAnalysis);
  const reportRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  const [progress, setProgress] = useState<Record<string, boolean>>(
    () => initialAnalysis?.roadmap_progress ?? {}
  );

  // Persist progress locally (debounced)
  useEffect(() => {
    if (!analysis) return;
    const timeout = setTimeout(async () => {
      const merged = { ...analysis, roadmap_progress: progress };
      setAnalysis(merged);
      localStorage.setItem("careerforge:last-analysis", JSON.stringify(merged));
    }, 600);
    return () => clearTimeout(timeout);
  }, [progress, analysis]);

  const phases = useMemo(() => {
    if (!analysis) return [];
    return [
      { key: "p1", data: analysis.detailed_roadmap.phase_1, dot: "bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.6)]" },
      { key: "p2", data: analysis.detailed_roadmap.phase_2, dot: "bg-dim" },
      { key: "p3", data: analysis.detailed_roadmap.phase_3, dot: "bg-muted-foreground" },
    ];
  }, [analysis]);

  const handleExportPdf = async () => {
    if (!reportRef.current || !analysis) return;
    setExporting(true);
    try {
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import("jspdf"),
        import("html2canvas"),
      ]);

      const canvas = await html2canvas(reportRef.current, {
        backgroundColor: "#111213",
        scale: 2,
        useCORS: true,
        windowWidth: reportRef.current.scrollWidth,
      });

      const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const pageHeightPx = Math.floor((pageHeight * canvas.width) / pageWidth);
      const totalPages = Math.ceil(canvas.height / pageHeightPx);

      for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
        if (pageIndex > 0) pdf.addPage();

        const sourceY = pageIndex * pageHeightPx;
        const sourceHeight = Math.min(pageHeightPx, canvas.height - sourceY);

        const pageCanvas = document.createElement("canvas");
        pageCanvas.width = canvas.width;
        pageCanvas.height = sourceHeight;
        const pageCtx = pageCanvas.getContext("2d");
        if (!pageCtx) throw new Error("Failed to create page render context");

        pageCtx.drawImage(
          canvas,
          0,
          sourceY,
          canvas.width,
          sourceHeight,
          0,
          0,
          canvas.width,
          sourceHeight
        );

        // Keep PDF background consistent with app theme.
        pdf.setFillColor(17, 18, 19);
        pdf.rect(0, 0, pageWidth, pageHeight, "F");

        const renderedHeightPt = (sourceHeight * pageWidth) / canvas.width;
        const pageImgData = pageCanvas.toDataURL("image/jpeg", 0.92);
        pdf.addImage(pageImgData, "JPEG", 0, 0, pageWidth, renderedHeightPt);
      }

      pdf.save(`CareerForge-Analysis-${Date.now()}.pdf`);
      toast({ title: "Exported", description: "PDF report downloaded." });
    } catch (e) {
      toast({
        title: "Export failed",
        description: e instanceof Error ? e.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  if (!analysis) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-dim mb-4">No analysis data found.</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="text-primary hover:underline text-sm"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const totalMilestones = phases.reduce((sum, p) => sum + p.data.milestones.length, 0);
  const completedMilestones = Object.values(progress).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -right-32 w-[480px] h-[480px] rounded-full opacity-[0.07] blur-3xl"
        style={{ background: "radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 -left-40 w-[420px] h-[420px] rounded-full opacity-[0.05] blur-3xl"
        style={{ background: "radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)" }}
      />

      <header className="border-b border-border/60 px-6 md:px-8 py-5 flex justify-between items-center bg-background/80 backdrop-blur-xl sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-dim hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="text-xl font-serif font-medium tracking-tight text-primary italic">
            CareerForge.
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-xs font-semibold tracking-[0.15em] text-dim uppercase hidden sm:block">
            Analysis Results
          </div>
          <button
            onClick={handleExportPdf}
            disabled={exporting}
            className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.15em] bg-primary text-primary-foreground px-4 py-2 rounded-sm hover:opacity-90 transition-opacity disabled:opacity-50 shadow-[var(--shadow-warm)]"
          >
            {exporting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            {exporting ? "Generating..." : "Export PDF"}
          </button>
        </div>
      </header>

      <main
        ref={reportRef}
        className="max-w-5xl mx-auto px-6 md:px-8 py-12 flex flex-col gap-10 relative z-10"
      >
        {/* Top: Score + Summary */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-strong rounded-md p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start"
        >
          <div className="flex flex-col items-center gap-4">
            <ScoreRing score={analysis.resume_score} />
            <span
              className={`text-xs uppercase tracking-widest font-semibold px-3 py-1 border rounded-sm ${
                analysis.classification === "Fresher"
                  ? "text-primary border-primary/30 bg-primary/10"
                  : "text-foreground border-border bg-secondary"
              }`}
            >
              {analysis.classification}
            </span>
          </div>
          <div className="flex-1">
            <h1 className="font-serif text-3xl mb-3">Analysis Complete</h1>
            <p className="text-dim leading-relaxed mb-4">{analysis.summary}</p>
            {analysis.linkedin_note && (
              <div className="text-xs text-primary bg-primary/5 border-l-2 border-primary px-3 py-2">
                {analysis.linkedin_note}
              </div>
            )}
            {totalMilestones > 0 && (
              <div className="mt-4 flex items-center gap-3 text-[11px] text-dim">
                <div className="flex-1 h-1 bg-border/60 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${(completedMilestones / totalMilestones) * 100}%` }}
                  />
                </div>
                <span className="font-semibold tracking-widest uppercase text-[10px]">
                  {completedMilestones}/{totalMilestones} done
                </span>
              </div>
            )}
          </div>
        </motion.section>

        {/* Critical Gaps */}
        {analysis.critical_gaps.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-xs font-semibold tracking-widest text-dim uppercase mb-4 flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5" /> Critical Gaps
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysis.critical_gaps.map((gap, i) => (
                <div key={i} className="glass p-5 rounded-sm">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-foreground font-medium text-sm">{gap.skill}</h3>
                    <SeverityBadge severity={gap.severity} />
                  </div>
                  <p className="text-dim text-sm leading-relaxed">{gap.recommendation}</p>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Technical Footprint */}
        {analysis.technical_footprint && analysis.technical_footprint.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <h2 className="text-xs font-semibold tracking-widest text-dim uppercase mb-4 flex items-center gap-2">
              <Code2 className="w-3.5 h-3.5" /> Technical Footprint
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysis.technical_footprint.map((repo, i) => (
                <a
                  key={i}
                  href={repo.repo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass p-5 rounded-sm flex flex-col gap-3 hover:border-primary/30 transition-colors group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <Code2 className="w-3.5 h-3.5 text-dim shrink-0" />
                      <span className="text-foreground font-medium text-sm truncate group-hover:text-primary transition-colors">
                        {repo.name}
                      </span>
                    </div>
                    {repo.language && (
                      <span className="text-[10px] uppercase tracking-widest font-semibold px-2 py-0.5 border border-primary/30 bg-primary/10 text-primary rounded-sm shrink-0">
                        {repo.language}
                      </span>
                    )}
                  </div>
                  <p className="text-dim text-xs leading-relaxed">{repo.insight}</p>
                  {repo.recommendation && (
                    <div className="flex items-start gap-2 text-[11px] text-primary bg-primary/5 border border-primary/20 px-2.5 py-2 rounded-sm">
                      <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
                      <span className="leading-relaxed">{repo.recommendation}</span>
                    </div>
                  )}
                </a>
              ))}
            </div>
          </motion.section>
        )}

        {/* Technical Integrity Audit */}
        {analysis.technical_validation && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
          >
            <TechnicalIntegrityCard technicalValidation={analysis.technical_validation} />
          </motion.section>
        )}

        {/* CV Optimization */}
        {analysis.cv_refinement_suggestions.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-xs font-semibold tracking-widest text-dim uppercase mb-4 flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5" /> CV Optimization
            </h2>
            <div className="flex flex-col gap-4">
              {analysis.cv_refinement_suggestions.map((sug, i) => (
                <div key={i} className="glass p-5 rounded-sm">
                  <div className="mb-3">
                    <span className="text-[10px] text-primary uppercase tracking-widest font-semibold">
                      {sug.section}
                    </span>
                    {sug.location_hint && (
                      <p className="text-dim text-xs mt-1 italic">📍 {sug.location_hint}</p>
                    )}
                    <p className="text-foreground text-sm font-medium mt-1">{sug.issue}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-destructive/5 border border-destructive/20 p-3 rounded-sm">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[9px] uppercase tracking-widest text-destructive font-bold">
                          Before
                        </span>
                      </div>
                      <p className="text-dim text-sm leading-relaxed">{sug.before}</p>
                    </div>
                    <div className="bg-primary/5 border border-primary/20 p-3 rounded-sm">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[9px] uppercase tracking-widest text-primary font-bold">
                          After
                        </span>
                        <CopyButton text={sug.after} />
                      </div>
                      <p className="text-foreground text-sm leading-relaxed">{sug.after}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Roadmap — Interactive */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-xs font-semibold tracking-widest text-dim uppercase mb-6">
            Learning Roadmap
          </h2>
          <div className="relative pl-6">
            <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" />
            <div className="flex flex-col gap-10">
              {phases.map((phase, pi) => (
                <div key={phase.key} className="relative">
                  <div className={`absolute -left-[17px] top-1.5 size-2 rounded-full ${phase.dot}`} />
                  <h3 className="text-foreground font-semibold text-sm mb-4">
                    {phase.data.title}
                  </h3>
                  <div className="flex flex-col gap-3">
                    {phase.data.milestones.map((m, mi) => {
                      const id = `${phase.key}-${mi}`;
                      const checked = !!progress[id];
                      const searchQuery = encodeURIComponent(`${m.task} tutorial`);
                      const searchUrl = `https://www.google.com/search?q=${searchQuery}`;
                      return (
                        <div
                          key={id}
                          className={`glass p-4 rounded-sm flex items-start gap-3 transition-opacity ${
                            checked ? "opacity-60" : ""
                          }`}
                        >
                          <Checkbox
                            id={id}
                            checked={checked}
                            onCheckedChange={(v) =>
                              setProgress((p) => ({ ...p, [id]: !!v }))
                            }
                            className="mt-0.5"
                          />
                          <div className="flex-1 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                            <label
                              htmlFor={id}
                              className={`text-sm flex-1 cursor-pointer ${
                                checked ? "line-through text-dim" : "text-foreground"
                              }`}
                            >
                              {m.task}
                            </label>
                            <div className="flex items-center gap-3 shrink-0">
                              <a
                                href={searchUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] uppercase tracking-widest font-semibold text-primary hover:text-primary/80 flex items-center gap-1 border border-primary/30 px-2 py-1 rounded-sm bg-primary/5"
                              >
                                <Search className="w-3 h-3" /> Study
                              </a>
                              {m.resource_url && (
                                <a
                                  href={m.resource_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline text-xs flex items-center gap-1"
                                >
                                  {m.resource_title || "Resource"}{" "}
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Verified GitHub Skills */}
        {analysis.verified_github_skills && analysis.verified_github_skills.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-xs font-semibold tracking-widest text-dim uppercase mb-4 flex items-center gap-2">
              <Shield className="w-3.5 h-3.5" /> Verified GitHub Skills
            </h2>
            <div className="flex flex-wrap gap-3">
              {analysis.verified_github_skills.map((s, i) => (
                <a
                  key={i}
                  href={s.repo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass px-4 py-2 rounded-sm flex items-center gap-2 hover:border-primary/40 transition-colors"
                >
                  <span className="text-foreground text-sm font-medium">{s.skill}</span>
                  <span className="text-dim text-xs">({s.repo})</span>
                </a>
              ))}
            </div>
          </motion.section>
        )}

        <div className="text-center text-[10px] uppercase tracking-[0.2em] text-dim pt-6">
          CareerForge · AI Career Assistant
        </div>
      </main>
    </div>
  );
};

export default Results;
