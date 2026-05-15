import type { AnalysisResult } from "@/types/analysis";

interface RepoData {
  name: string;
  language: string | null;
  description: string | null;
  stargazers_count: number;
  html_url: string;
}

interface RepoTreeData {
  repo_name: string;
  repo_url: string;
  total_files: number;
  root_directories: string[];
  testing_files: string[];
  devops_files: string[];
  architecture_markers: string[];
}

async function fetchGitHubData(githubUrl: string): Promise<{
  repos: RepoData[];
  languages: string[];
  repoTrees: RepoTreeData[];
}> {
  try {
    const username = githubUrl.replace(/\/$/, "").split("/").pop();
    if (!username) return { repos: [], languages: [], repoTrees: [] };

    const headers: Record<string, string> = {
      "User-Agent": "CareerForge-Bot/1.0",
      Accept: "application/vnd.github.v3+json",
    };

    const githubToken = import.meta.env.VITE_GITHUB_TOKEN;
    if (githubToken) {
      headers["Authorization"] = `Bearer ${githubToken}`;
    }

    const res = await fetch(
      `https://api.github.com/users/${username}/repos?sort=stars&per_page=5`,
      { headers }
    );

    if (!res.ok) {
      console.warn("GitHub API error:", res.status);
      return { repos: [], languages: [], repoTrees: [] };
    }

    const repos: RepoData[] = await res.json();
    const languages = [
      ...new Set(repos.map((r) => r.language).filter(Boolean)),
    ] as string[];
    const topRepos = repos.slice(0, 3);

    const repoTrees = await Promise.all(
      topRepos.map(async (repo) => {
        const empty: RepoTreeData = {
          repo_name: repo.name,
          repo_url: repo.html_url,
          total_files: 0,
          root_directories: [],
          testing_files: [],
          devops_files: [],
          architecture_markers: [],
        };
        try {
          let treeData: { tree?: Array<{ type?: string; path?: string }> } | null = null;

          const mainRes = await fetch(
            `https://api.github.com/repos/${username}/${repo.name}/git/trees/main?recursive=1`,
            { headers }
          );
          if (mainRes.ok) {
            treeData = await mainRes.json();
          } else {
            const masterRes = await fetch(
              `https://api.github.com/repos/${username}/${repo.name}/git/trees/master?recursive=1`,
              { headers }
            );
            if (masterRes.ok) treeData = await masterRes.json();
          }

          if (!treeData) return empty;

          const paths = (treeData.tree ?? [])
            .filter((n) => n.type === "blob" && !!n.path)
            .map((n) => n.path as string);

          return {
            repo_name: repo.name,
            repo_url: repo.html_url,
            total_files: paths.length,
            root_directories: [
              ...new Set(paths.map((p) => p.split("/")[0]).filter(Boolean)),
            ].slice(0, 8),
            testing_files: paths
              .filter((p) =>
                /(?:^|\/)(test|tests|spec|__tests__|jest|vitest|cypress|playwright)/i.test(p)
              )
              .slice(0, 12),
            devops_files: paths
              .filter((p) =>
                /(?:^|\/)(Dockerfile|docker-compose|\.github\/workflows|\.gitlab-ci|Jenkinsfile|k8s|helm|terraform|ansible)/i.test(
                  p
                )
              )
              .slice(0, 12),
            architecture_markers: paths
              .filter((p) =>
                /(?:^|\/)(src\/|apps\/|packages\/|services\/|api\/|microservices|README|docs\/architecture|domain|infra)/i.test(
                  p
                )
              )
              .slice(0, 12),
          };
        } catch {
          return empty;
        }
      })
    );

    return {
      repos: repos.map((r) => ({
        name: r.name,
        language: r.language,
        description: r.description,
        stargazers_count: r.stargazers_count,
        html_url: r.html_url,
      })),
      languages,
      repoTrees,
    };
  } catch {
    return { repos: [], languages: [], repoTrees: [] };
  }
}

const SYSTEM_PROMPT = `You are a Senior Technical Recruiter and Career Strategist. Analyze the provided CV and GitHub data.

INSTRUCTIONS:
1. **Identify Level**: Classify as "Fresher" (0-1yr professional experience) or "Experienced" (2+ years). Base this on dates of employment, number of roles, and depth of project descriptions.
2. **Gap Analysis**: If a Job Description is provided, perform a direct skill-by-skill comparison. If no JD is given, compare against industry standards for the user's top identified skill.
3. **Validation**: Cross-reference CV project claims with GitHub repository data. Flag any discrepancies or unverified claims. List verified skills found on GitHub.
4. **Resume Score**: Give an overall match score from 0-100 based on relevance, completeness, and alignment.
5. **CV Refinement**: Provide specific before/after rewrite suggestions for weak bullet points. CRITICAL: The "before" field MUST be a VERBATIM quote copied exactly from the resume text — do NOT paraphrase, summarize, or invent text. Also provide a "location_hint" describing exactly where to find this text in the CV. If you cannot find a verbatim weak bullet to quote, do NOT fabricate one — skip that suggestion.
6. **Technical Footprint**: For each GitHub repo provided, generate a "technical_footprint" entry with a 1-sentence insight tying it to the CV/JD. Add a "recommendation" string ONLY when there's a real discrepancy. Otherwise set "recommendation" to null.
7. **Roadmap**: Create a 3-phase learning roadmap (Immediate 0-2 weeks, Intermediate 2-6 weeks, Advanced 6-12 weeks) with specific milestones and resource links.
8. **Technical Integrity Module**: Build a deep audit block named "technical_validation" using GitHub tree evidence evaluating testing maturity, DevOps standards, and architectural complexity.
   Return:
   - complexity_score: number 0-100
   - detected_seniority: one of Junior/Mid/Senior/Staff
   - proven_skills: only skills with concrete repository evidence
   - project_upgrade_path: 3-6 specific high-impact project upgrades

OUTPUT FORMAT: Return a valid JSON object with exactly this structure:
{
  "classification": "Fresher" | "Experienced",
  "resume_score": number (0-100),
  "summary": "Brief 2-sentence assessment",
  "critical_gaps": [{"skill": "string", "severity": "high"|"medium"|"low", "recommendation": "string"}],
  "verified_github_skills": [{"skill": "string", "repo": "string", "repo_url": "string"}],
  "cv_refinement_suggestions": [{"section": "string", "location_hint": "string", "issue": "string", "before": "string (verbatim quote from CV)", "after": "string"}],
  "technical_footprint": [{"name": "string (repo name)", "language": "string or null", "repo_url": "string", "insight": "string", "recommendation": "string or null"}],
  "technical_validation": {
    "complexity_score": number (0-100),
    "detected_seniority": "Junior" | "Mid" | "Senior" | "Staff",
    "proven_skills": ["string"],
    "project_upgrade_path": ["string"]
  },
  "detailed_roadmap": {
    "phase_1": {"title": "Immediate (0-2 weeks)", "milestones": [{"task": "string", "resource_url": "string", "resource_title": "string"}]},
    "phase_2": {"title": "Intermediate (2-6 weeks)", "milestones": [{"task": "string", "resource_url": "string", "resource_title": "string"}]},
    "phase_3": {"title": "Advanced (6-12 weeks)", "milestones": [{"task": "string", "resource_url": "string", "resource_title": "string"}]}
  },
  "linkedin_note": "string or null"
}`;

export async function analyzeCareerProfile(params: {
  resumeText: string;
  jobDescription: string;
  githubUrl: string;
  linkedinUrl: string;
}): Promise<AnalysisResult> {
  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    throw new Error(
      "Gemini API key is not configured. Please add VITE_GEMINI_API_KEY to your .env file."
    );
  }

  const { resumeText, jobDescription, githubUrl, linkedinUrl } = params;

  // Fetch GitHub data client-side
  const githubData = githubUrl
    ? await fetchGitHubData(githubUrl)
    : { repos: [], languages: [], repoTrees: [] };

  const linkedinNote = linkedinUrl
    ? "LinkedIn profile detected; verify endorsements manually for soft-skill validation."
    : null;

  const userMessage = `
## Resume/CV Text:
${resumeText}

${jobDescription ? `## Target Job Description:\n${jobDescription}` : "## No Job Description provided — compare against industry standards."}

## GitHub Data:
${
  githubData.repos.length > 0
    ? `Top repositories:\n${githubData.repos
        .map(
          (r) =>
            `- ${r.name} (${r.language || "N/A"}): ${r.description || "No description"} [${r.stargazers_count}★] ${r.html_url}`
        )
        .join("\n")}\n\nPrimary languages: ${githubData.languages.join(", ")}`
    : "No GitHub data available."
}

${
  githubData.repoTrees.length > 0
    ? `\n## GitHub Recursive File Trees for Top 3 repos:\n${githubData.repoTrees
        .map(
          (tree) =>
            `- ${tree.repo_name} (${tree.repo_url})
  - total_files: ${tree.total_files}
  - root_directories: ${tree.root_directories.join(", ") || "none detected"}
  - testing_files: ${tree.testing_files.join(", ") || "none detected"}
  - devops_files: ${tree.devops_files.join(", ") || "none detected"}
  - architecture_markers: ${tree.architecture_markers.join(", ") || "none detected"}`
        )
        .join("\n")}`
    : ""
}

${linkedinNote ? `\n## LinkedIn Note:\n${linkedinNote}` : ""}
`;

  const MODEL = "gemini-flash-latest";

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: SYSTEM_PROMPT }],
        },
        contents: [{ role: "user", parts: [{ text: userMessage }] }],
        generationConfig: {
          responseMimeType: "application/json",
        },
      }),
    }
  );

  if (!response.ok) {
    const status = response.status;
    if (status === 429) {
      throw new Error("Rate limit exceeded. Please try again in a moment.");
    }
    if (status === 400) {
      throw new Error("Invalid API key or request. Check your VITE_GEMINI_API_KEY.");
    }
    const errText = await response.text();
    console.error("Gemini API error:", status, errText);
    throw new Error(`AI analysis failed (${status})`);
  }

  const llmData = await response.json();
  const content = llmData?.candidates?.[0]?.content?.parts
    ?.map((part: { text?: string }) => part.text ?? "")
    .join("");

  if (!content) throw new Error("Empty response from AI");

  let analysisResult: AnalysisResult;
  try {
    analysisResult = JSON.parse(content);
  } catch {
    const match = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (match) {
      analysisResult = JSON.parse(match[1]);
    } else {
      throw new Error("Failed to parse AI response as JSON");
    }
  }

  if (linkedinNote) {
    analysisResult.linkedin_note = linkedinNote;
  }

  return analysisResult;
}
