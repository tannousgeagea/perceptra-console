import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/ui/button';
import { Keyboard } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/ui/dialog';
import { isTypingTarget } from './hotkeys';

const MOD = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform) ? '⌘' : 'Ctrl';

const SECTIONS: { title: string; shortcuts: { keys: string[]; action: string }[] }[] = [
  {
    title: 'Labeling',
    shortcuts: [
      { keys: ['1–9'], action: 'With a box selected: give it that class and save' },
      { keys: ['Enter'], action: 'Save the selected box' },
      { keys: ['Esc'], action: 'Cancel edits to the selected box' },
      { keys: ['Delete'], action: 'Delete selected annotation' },
      { keys: ['Shift', 'V'], action: 'Copy annotations from the previous image' },
      { keys: [MOD, 'Z'], action: 'Undo' },
      { keys: [MOD, 'Shift', 'Z'], action: 'Redo' },
    ],
  },
  {
    title: 'Image',
    shortcuts: [
      { keys: ['Enter'], action: 'Approve image and go to the next (nothing selected)' },
      { keys: ['E'], action: 'Mark image empty and go to the next / restore it' },
      { keys: ['←', '→'], action: 'Previous / next image' },
    ],
  },
  {
    title: 'Tools & view',
    shortcuts: [
      { keys: ['1'], action: 'Box (draw) tool — when nothing is selected' },
      { keys: ['2'], action: 'Move / select tool' },
      { keys: ['3'], action: 'Polygon tool' },
      { keys: ['S', 'hold'], action: 'Temporarily select — release to return to draw' },
      { keys: ['Ctrl', 'Scroll'], action: 'Zoom in / out' },
      { keys: ['Alt', 'Drag'], action: 'Pan canvas' },
      { keys: ['?'], action: 'Show this list' },
    ],
  },
];

const KeyboardShortcuts: React.FC = () => {
  const [open, setOpen] = useState(false);

  // "?" opens the list from anywhere in the annotator.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '?' && !isTypingTarget(e) && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2" title="Keyboard shortcuts (?)">
          <Keyboard className="h-4 w-4" />
          Shortcuts
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-md overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>
            Draw a box, press a number, repeat. Press Enter to approve and move on.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {SECTIONS.map((section) => (
            <div key={section.title}>
              <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {section.title}
              </h4>
              {section.shortcuts.map((shortcut) => (
                <div
                  key={shortcut.action}
                  className="flex items-center justify-between gap-4 rounded-md p-2 hover:bg-muted"
                >
                  <span className="text-sm text-foreground">{shortcut.action}</span>
                  <div className="flex shrink-0 gap-1">
                    {shortcut.keys.map((key, i) => (
                      <React.Fragment key={i}>
                        <kbd className="rounded border border-border bg-muted px-2 py-1 text-xs font-semibold">
                          {key}
                        </kbd>
                        {i < shortcut.keys.length - 1 && <span className="text-muted-foreground">+</span>}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default KeyboardShortcuts;
