import * as React from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/ui/tooltip";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";

interface CopyableIdProps {
  /** The full value written to the clipboard. */
  value: string | number;
  /** Used in the toast / tooltip, e.g. "Image ID". */
  label?: string;
  /** Text shown before the value, e.g. "ID:". */
  prefix?: string;
  /** Show only the first N characters (the full value is still copied). */
  truncate?: number;
  /** Render only the copy icon, without the value. */
  iconOnly?: boolean;
  className?: string;
}

/**
 * Click-to-copy identifier. Stops event propagation so it can live inside
 * clickable cards and table rows without triggering their handlers.
 */
export function CopyableId({
  value,
  label = "ID",
  prefix,
  truncate,
  iconOnly = false,
  className,
}: CopyableIdProps) {
  const { copy, copied } = useCopyToClipboard();
  const text = String(value);
  const shown = truncate && text.length > truncate ? `${text.slice(0, truncate)}…` : text;
  const Icon = copied ? Check : Copy;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    void copy(text, label);
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={handleClick}
          aria-label={`Copy ${label}`}
          className={cn(
            "group/copy inline-flex max-w-full min-w-0 items-center gap-1 rounded px-1 -mx-1",
            "font-mono text-xs text-muted-foreground transition-colors",
            "hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
            className
          )}
        >
          {!iconOnly && (
            <span className="truncate">
              {prefix && <span className="font-sans">{prefix} </span>}
              {shown}
            </span>
          )}
          <Icon
            className={cn(
              "h-3 w-3 shrink-0 transition-opacity",
              copied ? "text-emerald-500 opacity-100" : "opacity-60 group-hover/copy:opacity-100"
            )}
          />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs break-all font-mono text-xs">
        {copied ? "Copied!" : `Copy ${label}: ${text}`}
      </TooltipContent>
    </Tooltip>
  );
}
