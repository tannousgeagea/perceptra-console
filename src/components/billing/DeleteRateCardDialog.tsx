import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/ui/alert-dialog";
import { BillingRateCard } from "@/types/billing";
import { toast } from "sonner";

interface DeleteRateCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rateCard: BillingRateCard;
  onSuccess: (cardId: string) => void;
}

export function DeleteRateCardDialog({ open, onOpenChange, rateCard, onSuccess }: DeleteRateCardDialogProps) {
  const handleDelete = () => {
    onSuccess(rateCard.rate_card_id);
    toast.success("Rate card deleted successfully");
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Rate Card</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{rateCard.name}"? This action cannot be undone.
            {rateCard.is_active && (
              <span className="block mt-2 text-destructive font-medium">
                Warning: This rate card is currently active.
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
