// The one-time code and the commands that use it. Shown once: right after a
// device is added, or after asking for a new code.
import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/ui/tabs';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import type { Enrollment } from '@/types/fleet';
import { dateTime, platformUrl } from './format';

function Snippet({ text, label }: { text: string; label: string }) {
  const { copy, copied } = useCopyToClipboard();
  return (
    <div className="relative">
      <pre className="overflow-x-auto rounded-md bg-muted px-3 py-2.5 pr-11 text-xs leading-relaxed"><code>{text}</code></pre>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute right-1 top-1 h-7 w-7"
        onClick={() => copy(text, label)}
        aria-label={`Copy ${label.toLowerCase()}`}
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      </Button>
    </div>
  );
}

export function EnrollmentCode({ enrollment, deviceName }: { enrollment: Enrollment; deviceName: string }) {
  const { copy, copied } = useCopyToClipboard();
  const url = platformUrl();
  const pip = [
    'pip install ./edge-agent',
    `malumetrix-edge --url ${url} enroll --code ${enrollment.code}`,
    `malumetrix-edge --url ${url} run`,
  ].join('\n');
  const docker = [
    'docker run -d --name malumetrix-edge --restart unless-stopped \\',
    '  -v malumetrix-data:/var/lib/malumetrix \\',
    `  -e MALUMETRIX_URL=${url} \\`,
    `  -e MALUMETRIX_ENROLL_CODE=${enrollment.code} \\`,
    `  ${enrollment.agent_image ?? 'malumetrix-edge-agent'}`,
  ].join('\n');
  const sdk = [
    'from malumetrix_edge import EdgeClient',
    '',
    `edge = EdgeClient(url="${url}", code="${enrollment.code}",`,
    '                  on_model_update=load)   # your function: load the file, return True if it works',
    'edge.start()',
  ].join('\n');

  return (
    <div className="space-y-5">
      <div className="rounded-lg border bg-muted/40 p-4">
        <p className="text-sm text-muted-foreground">One-time code for {deviceName}</p>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <span className="select-all font-mono text-2xl font-semibold tracking-[0.15em]">{enrollment.code}</span>
          <Button type="button" variant="outline" size="sm" onClick={() => copy(enrollment.code, 'Code')}>
            {copied ? <Check className="mr-1.5 h-3.5 w-3.5" /> : <Copy className="mr-1.5 h-3.5 w-3.5" />}
            Copy code
          </Button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Works once, until {dateTime(enrollment.expires_at)}. It won't be shown again; you can ask for a new one on the device's page.
        </p>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium">Start the agent on the device</h3>
        <Tabs defaultValue="docker">
          <TabsList>
            <TabsTrigger value="docker">Docker</TabsTrigger>
            <TabsTrigger value="pip">Python</TabsTrigger>
            <TabsTrigger value="sdk">Inside your app</TabsTrigger>
          </TabsList>
          <TabsContent value="docker" className="space-y-2">
            <Snippet text={docker} label="Docker command" />
            <p className="text-xs text-muted-foreground">
              {enrollment.agent_image
                ? 'Docker pulls the agent image, the same release as this platform. '
                : <>Build the image from <code>edge-agent/</code> first. </>}
              Your inference container mounts the same volume and loads{' '}
              <code>models/&lt;model_id&gt;/current/</code>.
            </p>
          </TabsContent>
          <TabsContent value="pip" className="space-y-2">
            <Snippet text={pip} label="Commands" />
            <p className="text-xs text-muted-foreground">Python 3.8 or newer, nothing else to install. Run it as a service so it restarts with the device.</p>
          </TabsContent>
          <TabsContent value="sdk" className="space-y-2">
            <Snippet text={sdk} label="Python code" />
            <p className="text-xs text-muted-foreground">If your inference runs in Python, the agent can live inside it; returning False rolls the version back.</p>
          </TabsContent>
        </Tabs>
        <p className="text-xs text-muted-foreground">
          The device only makes outgoing calls to {url}; it needs no open port. The agent's README covers reload hooks, health checks and the local API.
        </p>
      </div>
    </div>
  );
}
