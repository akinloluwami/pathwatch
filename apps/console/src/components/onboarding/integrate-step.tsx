import { Button } from '@/components/ui/button';
import Brackets from '@/components/ui/brackets';
import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

type Language = 'javascript' | 'python' | 'curl' | 'go';

interface IntegrateStepProps {
  apiKey: string;
  onFinish: () => void;
}

export function IntegrateStep({ apiKey, onFinish }: IntegrateStepProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('javascript');
  const [copiedCode, setCopiedCode] = useState(false);

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
    <>
      {/* Title */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl uppercase tracking-[0.2em] font-mono">Setup Instructions</h1>
        <p className="text-gray-400 text-xs uppercase tracking-[0.2em]">
          Integrate PathWatch into your application
        </p>
      </div>

      {/* Setup Instructions */}
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
          <Button onClick={onFinish} className="min-w-[200px]">
            Go to Dashboard
          </Button>
        </div>
      </div>
    </>
  );
}
