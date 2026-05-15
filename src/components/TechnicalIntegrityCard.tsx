import { ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TechnicalIntegrityCardProps {
  technicalValidation?: {
    complexity_score: number;
    detected_seniority: string;
    proven_skills: string[];
    project_upgrade_path: string[];
  };
}

const TechnicalIntegrityCard = ({ technicalValidation }: TechnicalIntegrityCardProps) => {
  if (!technicalValidation) return null;

  const normalizedScore = Math.max(0, Math.min(100, technicalValidation.complexity_score ?? 0));

  return (
    <Card className="border border-amber-400/35 bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-zinc-100 shadow-[0_0_0_1px_rgba(251,191,36,0.1),0_18px_45px_rgba(0,0,0,0.55)]">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between gap-3 text-sm uppercase tracking-[0.18em] text-amber-300">
          <span className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            Technical Integrity Audit
          </span>
          <span className="rounded-sm border border-amber-400/35 bg-amber-400/10 px-2 py-1 text-[10px] font-semibold text-amber-200">
            Executive Titanium
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.15em] text-zinc-400">
            <span>Architectural Complexity</span>
            <span className="font-semibold text-amber-300">{normalizedScore}/100</span>
          </div>
          <div className="h-2 rounded-full bg-zinc-800">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-200 transition-all"
              style={{ width: `${normalizedScore}%` }}
            />
          </div>
          <p className="text-xs text-zinc-400">
            Detected seniority band:{" "}
            <span className="font-semibold uppercase tracking-wide text-amber-200">
              {technicalValidation.detected_seniority || "Unknown"}
            </span>
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-400">Proven Skills</h3>
          <div className="flex flex-wrap gap-2">
            {technicalValidation.proven_skills?.length ? (
              technicalValidation.proven_skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-sm border border-amber-400/30 bg-amber-400/10 px-2 py-1 text-[11px] text-amber-100"
                >
                  {skill}
                </span>
              ))
            ) : (
              <span className="text-xs text-zinc-500">No high-confidence skills detected.</span>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-400">Project Upgrade Path</h3>
          <ul className="space-y-2">
            {(technicalValidation.project_upgrade_path ?? []).slice(0, 4).map((item) => (
              <li key={item} className="text-sm text-zinc-300 leading-relaxed">
                <span className="mr-2 text-amber-300">•</span>
                {item}
              </li>
            ))}
            {!technicalValidation.project_upgrade_path?.length && (
              <li className="text-xs text-zinc-500">No upgrade recommendations generated.</li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default TechnicalIntegrityCard;
