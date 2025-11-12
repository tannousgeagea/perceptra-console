import { cn } from "@/lib/utils";

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

export const TabButton = ({ active, onClick, children }: TabButtonProps) => (
  <button
    onClick={onClick}
    className={cn(
      "px-6 py-3 font-medium transition-all whitespace-nowrap",
      active
        ? "text-primary border-b-2 border-primary bg-primary-light/30"
        : "text-muted-foreground hover:text-foreground hover:bg-muted"
    )}
  >
    {children}
  </button>
);
