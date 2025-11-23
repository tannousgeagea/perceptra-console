import React from 'react';
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

const KeyboardShortcuts: React.FC = () => {
  const shortcuts = [
    { keys: ['Ctrl', 'Scroll'], action: 'Zoom in/out' },
    { keys: ['Alt', 'Drag'], action: 'Pan canvas' },
    { keys: ['Esc'], action: 'Cancel current action' },
    { keys: ['Delete'], action: 'Delete selected annotation' },
    { keys: ['1'], action: 'Box tool' },
    { keys: ['2'], action: 'Move tool' },
    { keys: ['3'], action: 'Polygon tool' },
    { keys: ['Enter'], action: 'Accept selected suggestion' },
    { keys: ['Backspace'], action: 'Reject selected suggestion' },
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Keyboard className="h-4 w-4" />
          Shortcuts
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>
            Speed up your annotation workflow with these shortcuts
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          {shortcuts.map((shortcut, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 rounded-md hover:bg-muted"
            >
              <span className="text-sm text-foreground">{shortcut.action}</span>
              <div className="flex gap-1">
                {shortcut.keys.map((key, i) => (
                  <React.Fragment key={i}>
                    <kbd className="px-2 py-1 text-xs font-semibold bg-muted border border-border rounded">
                      {key}
                    </kbd>
                    {i < shortcut.keys.length - 1 && (
                      <span className="text-muted-foreground">+</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default KeyboardShortcuts;