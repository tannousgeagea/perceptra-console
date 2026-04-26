import React, { useState, useMemo } from 'react';
import { AnnotationClass } from '@/types/classes'; 
import { useAnnotationGeometry } from "@/contexts/AnnotationGeometryContext";
import { useAnnotationState } from '@/contexts/AnnotationStateContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/ui/tabs';
import { Badge } from '@/components/ui/ui/badge';
import { Button } from '@/components/ui/ui/button';
import { Sparkles, GripVertical, MoreVertical, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { FindObjectsDialog } from './FindObjectsDialog';

interface LabelPanelProps {
  classes: AnnotationClass[];
}

const LabelPanel: React.FC<LabelPanelProps> = ({ classes }) => {
  const { getBoxesArray, setAllBoxes } = useAnnotationGeometry();
  const { setSelectedBox, hoveredBoxId, setHoveredBoxId, setTool, selectedBox } = useAnnotationState();
  const boxes = getBoxesArray();
  const [findDialogOpen, setFindDialogOpen] = useState(false);

  const classesWithCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    boxes.forEach(box => {
      const key = box.label || 'unlabeled';
      counts[key] = (counts[key] || 0) + 1;
    });
    return classes.map(cls => ({
      ...cls,
      count: counts[cls.name] || 0,
    }));
  }, [classes, boxes]);

  const usedClasses = classesWithCounts.filter(c => c.count > 0);
  const unusedClasses = classesWithCounts.filter(c => c.count === 0);

  const handleLayerClick = (boxId: string) => {
    setSelectedBox(boxId);
    setTool('move');
  };

  const handleDeleteBox = (boxId: string) => {
    setAllBoxes(boxes.filter(b => b.id !== boxId));
    if (selectedBox === boxId) setSelectedBox(null);
  };


  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">

      {/* ── Header ── */}
      <div className="px-4 pt-4 pb-2 shrink-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-semibold text-foreground">Annotations</h3>
          <Badge variant="secondary" className="text-xs px-1.5 py-0">
            {boxes.length}
          </Badge>
        </div>
      </div>

      {/*
        ── Tabs ──
        Key insight: Radix TabsContent renders as `display:block` by default,
        which breaks flex height propagation. We override inactive panels to
        `display:none` (Radix already does this via `hidden`) and active ones
        to `display:flex` via the `data-[state=active]:flex` variant.
        The Tabs wrapper itself is `flex flex-col flex-1 min-h-0` so it
        fills remaining space between the header and the Tags footer.
      */}
      <Tabs
        defaultValue="classes"
        className="flex flex-col flex-1 min-h-0 overflow-hidden"
      >
        <TabsList className="mx-4 mb-2 grid w-auto grid-cols-2 bg-muted/50 shrink-0">
          <TabsTrigger value="classes" className="text-xs">Classes</TabsTrigger>
          <TabsTrigger value="layers" className="text-xs">Layers</TabsTrigger>
        </TabsList>

        {/* ── Classes Tab ── */}
        {/*
          Do NOT put `flex` here — let `data-[state=active]:flex` handle it.
          Radix sets `display:none` on inactive tabs; we set `display:flex`
          on the active one. This avoids the inactive tab stealing height.
        */}
        <TabsContent
          value="classes"
          className="data-[state=active]:flex flex-col flex-1 min-h-0 overflow-hidden"
        >
          {/* Scrollable list — grows to fill available space */}
          <div className="flex-1 min-h-0 overflow-y-auto">
            {usedClasses.map(cls => (
              <div
                key={cls.id}
                className="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-accent/30 transition-colors"
              >
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: cls.color }}
                />
                <span className="text-sm text-foreground flex-1 truncate">{cls.name}</span>
                <span className="text-xs text-muted-foreground tabular-nums">{cls.count}</span>
              </div>
            ))}
            {usedClasses.length === 0 && (
              <p className="text-xs text-muted-foreground py-4 text-center">No annotations yet</p>
            )}
          </div>

          {/* Unused classes — below the scroll area, does not scroll */}
          {unusedClasses.length > 0 && (
            <div className="border-t border-border pt-3 mt-3 shrink-0">
              <p className="text-xs font-medium text-muted-foreground mb-2">Unused Classes</p>
              <div className="space-y-1">
                {unusedClasses.map(cls => (
                  <div
                    key={cls.id}
                    className="flex items-center gap-2 py-1 px-2 text-muted-foreground"
                  >
                    <span className="text-sm italic flex-1 truncate">{cls.name}</span>
                    <Sparkles className="h-3.5 w-3.5 text-primary/60" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI button — always at bottom of tab, never scrolls away */}
          <div className="pt-3 pb-2 shrink-0 mt-auto">
            <Button
              variant="outline"
              size="sm"
              className="w-full border-primary/40 text-primary hover:bg-primary/10 gap-2"
              onClick={() => setFindDialogOpen(true)}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Find Objects with AI
            </Button>
          </div>
        </TabsContent>

        {/* ── Layers Tab ── */}
        <TabsContent
          value="layers"
          className="data-[state=active]:flex flex-col flex-1 min-h-0 mt-0 px-2 overflow-hidden"
        >
          <div className="flex-1 min-h-0 overflow-y-auto space-y-0.5">
            {boxes.map((box) => {
              const isHovered = hoveredBoxId === box.id;
              const isSelected = selectedBox === box.id;

              return (
                <div
                  key={box.id}
                  className={cn(
                    "flex items-center gap-1.5 py-1.5 px-2 rounded-md cursor-pointer transition-colors group",
                    isSelected && "bg-accent",
                    isHovered && !isSelected && "bg-accent/50",
                    !isSelected && !isHovered && "hover:bg-accent/30"
                  )}
                  onClick={() => handleLayerClick(box.id)}
                  onMouseEnter={() => setHoveredBoxId(box.id)}
                  onMouseLeave={() => setHoveredBoxId(null)}
                >
                  <GripVertical className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: box.color }}
                  />
                  <span className="text-sm text-foreground flex-1 truncate">
                    {box.label || 'unlabeled'}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-accent"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-32">
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive gap-2 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteBox(box.id);
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            })}
            {boxes.length === 0 && (
              <p className="text-xs text-muted-foreground py-4 text-center">
                No annotations yet
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* ── Tags: shrink-0 keeps it always visible at the bottom ── */}
      <div className="shrink-0 border-t border-border px-4 py-3">
        <h4 className="text-xs font-semibold text-foreground mb-2">Tags</h4>
        <div className="flex flex-col items-center py-3 text-center">
          <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center mb-2">
            <svg className="h-4 w-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
              <line x1="7" y1="7" x2="7.01" y2="7" />
            </svg>
          </div>
          <p className="text-xs font-medium text-foreground">No Tags Applied</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Type and select tags below to add them to the image.
          </p>
        </div>
      </div>

      <FindObjectsDialog
        open={findDialogOpen}
        onOpenChange={setFindDialogOpen}
        classes={classes}
      />
    </div>
  );
};

export default LabelPanel;