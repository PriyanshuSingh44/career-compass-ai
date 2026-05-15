export interface Milestone {
  task: string;
  resource_url: string;
  resource_title: string;
}

export interface AnalysisResult {
  classification: string;
  resume_score: number;
  summary: string;
  critical_gaps: Array<{ skill: string; severity: string; recommendation: string }>;
  verified_github_skills: Array<{ skill: string; repo: string; repo_url: string }>;
  technical_footprint?: Array<{
    name: string;
    language: string | null;
    repo_url: string;
    insight: string;
    recommendation: string | null;
  }>;
  technical_validation?: {
    complexity_score: number;
    detected_seniority: "Junior" | "Mid" | "Senior" | "Staff" | string;
    proven_skills: string[];
    project_upgrade_path: string[];
  };
  cv_refinement_suggestions: Array<{
    section: string;
    location_hint?: string;
    issue: string;
    before: string;
    after: string;
  }>;
  detailed_roadmap: {
    phase_1: { title: string; milestones: Milestone[] };
    phase_2: { title: string; milestones: Milestone[] };
    phase_3: { title: string; milestones: Milestone[] };
  };
  linkedin_note: string | null;
  roadmap_progress?: Record<string, boolean>;
}
