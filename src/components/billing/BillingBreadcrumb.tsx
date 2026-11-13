import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

/**
 * "Billing › <page>" above a billing sub-page's title: the way back to the
 * billing overview (in place of a back arrow beside the title).
 */
export function BillingBreadcrumb({ current }: { current: string }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-muted-foreground">
      <Link to="/billing" className="hover:text-foreground transition-colors">
        Billing
      </Link>
      <ChevronRight className="h-4 w-4" aria-hidden />
      <span className="text-foreground">{current}</span>
    </nav>
  );
}
