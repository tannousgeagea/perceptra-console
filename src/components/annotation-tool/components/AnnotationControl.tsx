import { useEffect, useRef, useState, memo, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";
import { useAnnotationState } from "@/contexts/AnnotationStateContext";
import { useNavigate } from "react-router-dom";
import { isTypingTarget } from "../hotkeys";

interface AnnotationControlsProps {
  title: string;
  subtitle?: string;
  current: number;
  total: number;
  onPrevious: () => void;
  onNext: () => void;
  backTo?: string;
  /** Where the back arrow goes, e.g. "Back to dataset" (tooltip / aria label). */
  backLabel?: string;
  /** Quick jumps between related views (dataset ⇄ job), shown under the title. */
  links?: { label: string; to: string }[];
  /** Inline extras after the title (status badges, copy-ID button). */
  titleAddon?: ReactNode;
  /** Right side of the header (save status, undo/redo, progress). */
  actions?: ReactNode;
  /** Override when navigation can continue past the loaded list (next page). */
  hasPrevious?: boolean;
  hasNext?: boolean;
}

const formatFileName = (name: string) => {
  const cleaned = name.replace(/\.[a-f0-9]{8,}\.jpg$/i, ".jpg");
  const readable = cleaned.replace(/_/g, " ");
  return readable.length > 70 ? `${readable.slice(0, 70)}...` : readable;
};

const AnnotationControls = memo(
  ({
    title,
    subtitle,
    current,
    total,
    onPrevious,
    onNext,
    backTo = "/projects",
    backLabel = "Back",
    links = [],
    titleAddon,
    actions,
    hasPrevious = current > 1,
    hasNext = current < total,
  }: AnnotationControlsProps) => {
    const navigate = useNavigate();
    const { setSelectedBox } = useAnnotationState();
    const [transitionKey, setTransitionKey] = useState<number>(0);

    // The canvas swaps in the next image's boxes itself once it has loaded, so
    // nothing is cleared here (clearing early flashed an empty canvas).
    const handlePrev = () => {
      if (hasPrevious) {
        setSelectedBox(null);
        setTransitionKey((k) => k + 1);
        onPrevious();
      }
    };

    const handleNext = () => {
      if (hasNext) {
        setSelectedBox(null);
        setTransitionKey((k) => k + 1);
        onNext();
      }
    };

    const handlersRef = useRef({ handlePrev, handleNext });
    handlersRef.current = { handlePrev, handleNext };

    useEffect(() => {
      const handleKey = (e: KeyboardEvent) => {
        if (isTypingTarget(e) || e.ctrlKey || e.metaKey || e.altKey) return;
        if (e.key === "ArrowLeft") handlersRef.current.handlePrev();
        if (e.key === "ArrowRight") handlersRef.current.handleNext();
      };
      window.addEventListener("keydown", handleKey);
      return () => window.removeEventListener("keydown", handleKey);
    }, []);

    return (
      <div className="relative flex items-center justify-between w-full bg-background/80 backdrop-blur-md border-b border-b-[1px] border-white/20 dark:border-white/30 px-4 py-2 shadow-[0_1px_0_0_rgba(255,255,255,0.1)]">
        {/* LEFT SECTION */}
        <div className="flex items-center gap-3 min-w-[250px]">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => navigate(backTo)}
                aria-label={backLabel}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{backLabel}</TooltipContent>
          </Tooltip>

          <div className="flex flex-col truncate max-w-[30vw]">
            <div className="flex items-center gap-2 min-w-0">
            <AnimatePresence mode="wait">
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.h2
                    key={transitionKey}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.25 }}
                    className="font-medium text-base md:text-lg truncate text-foreground"
                  >
                    {formatFileName(title)}
                  </motion.h2>
                </TooltipTrigger>
                <TooltipContent>{title}</TooltipContent>
              </Tooltip>
            </AnimatePresence>
            {titleAddon && <div className="flex shrink-0 items-center gap-1.5">{titleAddon}</div>}
            </div>

            {(subtitle || links.length > 0) && (
              <p className="text-xs text-muted-foreground truncate">
                {subtitle}
                {links.map((link, i) => (
                  <span key={link.to}>
                    {subtitle || i > 0 ? " · " : ""}
                    <button
                      type="button"
                      className="underline-offset-2 hover:underline hover:text-foreground"
                      onClick={() => navigate(link.to)}
                    >
                      {link.label}
                    </button>
                  </span>
                ))}
              </p>
            )}
          </div>
        </div>

        {/* CENTER NAVIGATION CONTROL */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center gap-3 bg-muted/40 rounded-xl px-3 py-1.5 shadow-sm">
          <Button
            size="icon"
            variant="ghost"
            disabled={!hasPrevious}
            onClick={handlePrev}
            aria-label="Previous"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <span className="text-sm min-w-[60px] text-center tabular-nums">
            <span className="text-muted-foreground">Image </span>
            <span className="font-semibold">{current}</span>
            <span className="text-muted-foreground"> of </span>
            <span className="font-semibold">{total}</span>
          </span>
          <Button
            size="icon"
            variant="ghost"
            disabled={!hasNext}
            onClick={handleNext}
            aria-label="Next"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* RIGHT SECTION (optional actions or placeholder for alignment) */}
        <div className="min-w-[150px] flex justify-end">{actions}</div>
      </div>
    );
  }
);

AnnotationControls.displayName = "AnnotationControls";
export default AnnotationControls;
