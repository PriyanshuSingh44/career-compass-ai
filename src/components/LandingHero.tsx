import { motion } from "framer-motion";
import { ArrowRight, FileText, Target, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

const LandingHero = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/60 px-6 md:px-8 py-5 flex justify-between items-center bg-background/90 backdrop-blur-xl sticky top-0 z-20">
        <div className="text-xl font-serif font-medium tracking-tight text-primary italic">
          CareerForge.
        </div>
        <nav className="hidden md:flex gap-10 text-sm font-medium text-dim">
          <a href="#features" className="hover:text-foreground transition-colors">
            Features
          </a>
          <a href="#how-it-works" className="hover:text-foreground transition-colors">
            How It Works
          </a>
          <button
            onClick={() => navigate("/dashboard")}
            className="text-foreground border-b border-foreground/30 pb-0.5"
          >
            Get Started
          </button>
        </nav>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 md:px-8 pt-20 pb-24 max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-xs font-semibold tracking-[0.2em] text-dim uppercase mb-8 flex items-center gap-3"
        >
          <span className="w-8 h-[1px] bg-border" />
          AI-Powered Career Intelligence
          <span className="w-8 h-[1px] bg-border" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-serif text-4xl sm:text-5xl md:text-7xl font-medium tracking-tight text-balance leading-[1.1] mb-8"
        >
          Forge your career path.
          <br />
          <span className="text-dim italic">Land the role.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-dim max-w-[55ch] mx-auto text-base md:text-lg mb-12 text-pretty leading-relaxed"
        >
          CareerForge analyzes your resume against any job description with
          surgical precision — detecting skill gaps, optimizing your CV, and
          building a personalized learning roadmap.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-primary text-primary-foreground px-8 py-3.5 text-sm font-semibold uppercase tracking-[0.15em] hover:opacity-90 transition-all shadow-[var(--shadow-warm)] flex items-center gap-2 rounded-sm"
          >
            Start Analysis
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              const el = document.getElementById("features");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
            className="bg-secondary text-foreground border border-border px-8 py-3.5 text-sm font-semibold uppercase tracking-[0.15em] hover:bg-accent transition-colors rounded-sm"
          >
            See How It Works
          </button>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 md:px-8 pb-32">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: FileText,
              title: "Smart CV Analysis",
              desc: "Auto-detects Fresher vs Experienced and scores your resume against the target role.",
            },
            {
              icon: Target,
              title: "Precision Matching",
              desc: "Compares your skills with JD requirements and cross-references GitHub activity.",
            },
            {
              icon: TrendingUp,
              title: "Growth Roadmap",
              desc: "Generates a phased learning plan with curated resources to close skill gaps.",
            },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-card border border-border p-8 rounded-sm"
            >
              <f.icon className="w-5 h-5 text-primary mb-4" />
              <h3 className="text-foreground font-semibold mb-2">{f.title}</h3>
              <p className="text-dim text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default LandingHero;
