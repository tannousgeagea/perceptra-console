import { useEffect, useState, memo } from "react";
import { ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";
import { useAnnotation } from "@/contexts/AnnotationContext";
import { useNavigate } from "react-router-dom";

interface AnnotationControlsProps {
  title: string;
  subtitle?: string;
  current: number;
  total: number;
  onPrevious: () => void;
  onNext: () => void;
  backTo?: string;
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
  }: AnnotationControlsProps) => {
    const navigate = useNavigate();
    const { setBoxes, setSelectedBox } = useAnnotation();
    const [transitionKey, setTransitionKey] = useState<number>(0);

    useEffect(() => {
      const handleKey = (e: KeyboardEvent) => {
        if (e.key === "ArrowLeft") handlePrev();
        if (e.key === "ArrowRight") handleNext();
      };
      window.addEventListener("keydown", handleKey);
      return () => window.removeEventListener("keydown", handleKey);
    }, [current, total]);

    const handlePrev = () => {
      if (current > 1) {
        setBoxes([]);
        setSelectedBox(null);
        setTransitionKey((k) => k + 1);
        onPrevious();
      }
    };

    const handleNext = () => {
      if (current < total) {

        console.log(current, total)
        setBoxes([]);
        setSelectedBox(null);
        setTransitionKey((k) => k + 1);
        onNext();
      }
    };

    return (
      <div className="relative flex items-center justify-between w-full bg-background/80 backdrop-blur-md border-b border-b-[1px] border-white/20 dark:border-white/30 px-4 py-2 shadow-[0_1px_0_0_rgba(255,255,255,0.1)]">
        {/* LEFT SECTION */}
        <div className="flex items-center gap-3 min-w-[250px]">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => navigate(backTo)}
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div className="flex flex-col truncate max-w-[45vw]">
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

            {subtitle && (
              <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
            )}
          </div>
        </div>

        {/* CENTER NAVIGATION CONTROL */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center gap-3 bg-muted/40 rounded-xl px-3 py-1.5 shadow-sm">
          <Button
            size="icon"
            variant="ghost"
            disabled={current <= 1}
            onClick={handlePrev}
            aria-label="Previous"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <span className="font-semibold text-sm min-w-[60px] text-center">
            {current} / {total}
          </span>
          <Button
            size="icon"
            variant="ghost"
            disabled={current >= total}
            onClick={handleNext}
            aria-label="Next"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* RIGHT SECTION (optional actions or placeholder for alignment) */}
        <div className="min-w-[150px] flex justify-end"></div>
      </div>
    );
  }
);

AnnotationControls.displayName = "AnnotationControls";
export default AnnotationControls;
