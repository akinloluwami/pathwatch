import { APP_NAME } from '@/constants';
import { Button } from '@/components/ui/button';
import Brackets from '@/components/ui/brackets';
import { createFileRoute } from '@tanstack/react-router';
import { useSession } from '@/lib/auth-client';
import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export const Route = createFileRoute('/onboarding')({
  component: OnboardingPage,
});

type Step = 1 | 2 | 3;
type Language = 'javascript' | 'python' | 'curl' | 'go';

function OnboardingPage() {
  const { data: session } = useSession();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [organizationName, setOrganizationName] = useState('');
  const [projectName, setProjectName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('javascript');
  const [copiedCode, setCopiedCode] = useState(false);
  const [apiKey] = useState('pw_' + Math.random().toString(36).substring(2, 15));

  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organizationName.trim()) return;

    setIsCreating(true);

    try {
      // TODO: Call API to create organization
      await new Promise((resolve) => setTimeout(resolve, 500));
      setCurrentStep(2);
    } catch (error) {
      console.error('Failed to create organization:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) return;

    setIsCreating(true);

    try {
      // TODO: Call API to create project
      await new Promise((resolve) => setTimeout(resolve, 500));
      setCurrentStep(3);
    } catch (error) {
      console.error('Failed to create project:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleFinish = () => {
    const orgSlug = organizationName.toLowerCase().replace(/\s+/g, '-');
    window.location.href = `/${orgSlug}/telmentary`;
  };

  const codeExamples: Record<Language, { install: string; code: string }> = {
    javascript: {
      install: 'npm install @pathwatch/sdk',
      code: `import { PathWatch } from '@pathwatch/sdk';

const pathwatch = new PathWatch({
  apiKey: '${apiKey}',
});

// Track API requests
app.use(pathwatch.middleware());

// Or track manually
pathwatch.track({
  path: '/api/users',
  method: 'GET',
  statusCode: 200,
  latency: 45,
});`,
    },
    python: {
      install: 'pip install pathwatch',
      code: `from pathwatch import PathWatch

pathwatch = PathWatch(api_key='${apiKey}')

# Track API requests
@app.middleware("http")
async def track_requests(request, call_next):
    response = await pathwatch.track_request(request, call_next)
    return response

# Or track manually
pathwatch.track(
    path="/api/users",
    method="GET",
    status_code=200,
    latency=45
)`,
    },
    curl: {
      install: '',
      code: `curl -X POST https://api.pathwatch.io/v1/ingest \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "path": "/api/users",
    "method": "GET",
    "statusCode": 200,
    "latency": 45,
    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
  }'`,
    },
    go: {
      install: 'go get github.com/pathwatch/pathwatch-go',
      code: `package main

import "github.com/pathwatch/pathwatch-go"

func main() {
    pw := pathwatch.New("${apiKey}")
    
    // Middleware for Gin
    r := gin.Default()
    r.Use(pw.Middleware())
    
    // Or track manually
    pw.Track(pathwatch.Event{
        Path:       "/api/users",
        Method:     "GET",
        StatusCode: 200,
        Latency:    45,
    })
}`,
    },
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeExamples[selectedLanguage].code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="flex flex-col h-screen overflow-auto">
      {/* Breadcrumb Top Bar */}
      <header className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-4">
            <StepBreadcrumb
              number="01"
              title="Org"
              active={currentStep === 1}
              completed={currentStep > 1}
            />
            <div className="text-gray-700 text-xs">/</div>
            <StepBreadcrumb
              number="02"
              title="Project"
              active={currentStep === 2}
              completed={currentStep > 2}
            />
            <div className="text-gray-700 text-xs">/</div>
            <StepBreadcrumb
              number="03"
              title="Integrate"
              active={currentStep === 3}
              completed={false}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="max-w-2xl w-full space-y-8">
          {/* Title */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl uppercase tracking-[0.2em] font-mono">
              {currentStep === 1 && 'Create Your Organization'}
              {currentStep === 2 && 'Create Your Project'}
              {currentStep === 3 && 'Setup Instructions'}
            </h1>
            <p className="text-gray-400 text-xs uppercase tracking-[0.2em]">
              {currentStep === 1 && "Let's get started by setting up your workspace"}
              {currentStep === 2 && 'Add your first project to start monitoring'}
              {currentStep === 3 && 'Integrate PathWatch into your application'}
            </p>
          </div>

          {/* Step 1: Organization Form */}
          {currentStep === 1 && (
            <form onSubmit={handleCreateOrganization} className="space-y-6">
              <div className="relative">
                <label
                  htmlFor="org-name"
                  className="block text-xs uppercase tracking-[0.2em] text-gray-400 mb-3 font-mono"
                >
                  Organization Name
                </label>
                <div className="relative">
                  <input
                    id="org-name"
                    type="text"
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    placeholder="My Company"
                    className="w-full h-12 px-4 bg-black border border-gray-700 text-white text-sm focus:outline-none focus:border-gray-400 transition-colors placeholder:text-gray-600"
                    required
                    autoFocus
                    disabled={isCreating}
                  />
                  <Brackets />
                </div>
                <p className="mt-2 text-xs text-gray-600 uppercase tracking-[0.15em]">
                  This will be used to identify your workspace
                </p>
              </div>

              <div className="flex justify-center pt-4">
                <Button
                  type="submit"
                  disabled={isCreating || !organizationName.trim()}
                  className="min-w-[200px]"
                >
                  {isCreating ? 'Creating...' : 'Continue'}
                </Button>
              </div>
            </form>
          )}

          {/* Step 2: Project Form */}
          {currentStep === 2 && (
            <form onSubmit={handleCreateProject} className="space-y-6">
              <div className="relative">
                <label
                  htmlFor="project-name"
                  className="block text-xs uppercase tracking-[0.2em] text-gray-400 mb-3 font-mono"
                >
                  Project Name
                </label>
                <div className="relative">
                  <input
                    id="project-name"
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="My API"
                    className="w-full h-12 px-4 bg-black border border-gray-700 text-white text-sm focus:outline-none focus:border-gray-400 transition-colors placeholder:text-gray-600"
                    required
                    autoFocus
                    disabled={isCreating}
                  />
                  <Brackets />
                </div>
                <p className="mt-2 text-xs text-gray-600 uppercase tracking-[0.15em]">
                  Name the API or service you want to monitor
                </p>
              </div>

              <div className="flex justify-center pt-4">
                <Button
                  type="submit"
                  disabled={isCreating || !projectName.trim()}
                  className="min-w-[200px]"
                >
                  {isCreating ? 'Creating...' : 'Continue'}
                </Button>
              </div>
            </form>
          )}

          {/* Step 3: Setup Instructions */}
          {currentStep === 3 && (
            <div className="space-y-6">
              {/* Language Selector */}
              <div className="flex gap-2 justify-center">
                {(['javascript', 'python', 'curl', 'go'] as Language[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setSelectedLanguage(lang)}
                    className={`relative px-4 py-2 text-xs uppercase tracking-[0.2em] border transition-colors ${
                      selectedLanguage === lang
                        ? 'border-gray-400 bg-white/10 text-white'
                        : 'border-gray-800 bg-black/40 text-gray-400 hover:bg-white/5'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>

              {/* API Key */}
              <div className="relative">
                <label className="block text-xs uppercase tracking-[0.2em] text-gray-400 mb-3 font-mono">
                  Your API Key
                </label>
                <div className="relative">
                  <div className="w-full h-12 px-4 bg-black border border-gray-700 text-white text-sm font-mono flex items-center justify-between">
                    <span className="truncate">{apiKey}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(apiKey);
                      }}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                  <Brackets />
                </div>
              </div>

              {/* Installation */}
              {codeExamples[selectedLanguage].install && (
                <div className="relative">
                  <label className="block text-xs uppercase tracking-[0.2em] text-gray-400 mb-3 font-mono">
                    Install
                  </label>
                  <div className="relative">
                    <div className="w-full px-4 py-3 bg-black border border-gray-700 text-accent text-sm font-mono">
                      {codeExamples[selectedLanguage].install}
                    </div>
                    <Brackets />
                  </div>
                </div>
              )}

              {/* Code Example */}
              <div className="relative">
                <label className="block text-xs uppercase tracking-[0.2em] text-gray-400 mb-3 font-mono">
                  Code Example
                </label>
                <div className="relative">
                  <div className="w-full p-4 bg-black border border-gray-700 text-white text-xs font-mono overflow-x-auto">
                    <button
                      onClick={handleCopyCode}
                      className="absolute top-2 right-2 p-2 text-gray-400 hover:text-white transition-colors"
                    >
                      {copiedCode ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                    <pre className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {codeExamples[selectedLanguage].code}
                    </pre>
                  </div>
                  <Brackets />
                </div>
              </div>

              <div className="flex justify-center pt-4">
                <Button onClick={handleFinish} className="min-w-[200px]">
                  Go to Dashboard
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function StepBreadcrumb({
  number,
  title,
  active,
  completed,
}: {
  number: string;
  title: string;
  active: boolean;
  completed: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`text-xs font-mono ${
          completed ? 'text-green-500' : active ? 'text-accent' : 'text-gray-600'
        }`}
      >
        [{number}]
      </div>
      <div
        className={`text-xs uppercase tracking-[0.2em] font-mono ${
          active ? 'text-white' : completed ? 'text-gray-400' : 'text-gray-600'
        }`}
      >
        {title}
      </div>
    </div>
  );
}
