import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Filter, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/ui/card";
import { Badge } from "@/components/ui/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/ui/select";
import { BillingRateCard } from "@/types/billing";
import { useUserProjects } from "@/hooks/useUserProjects";
import { useRateCards, useCreateRateCard, useUpdateRateCard, useDeleteRateCard, useDuplicateRateCard } from "@/hooks/useBillingRateCards";
import { CreateRateCardDialog } from "@/components/billing/CreateRateCardDialog";
import { EditRateCardDialog } from "@/components/billing/EditRateCardDialog";
import { DeleteRateCardDialog } from "@/components/billing/DeleteRateCardDialog";
import QueryState from "@/components/common/QueryState";

export default function Billing() {
  const [filterProject, setFilterProject] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedCard, setSelectedCard] = useState<BillingRateCard | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { data: projects, isLoading: loadingProjects, isError: errorProjects, refetch } = useUserProjects();
  const { data: rateCards, isLoading: loadingRateCards, isError: errorRateCards } = useRateCards()

  const { mutate: createRateCard, isPending: pendingCreateRateCard } = useCreateRateCard({
    onSuccess: (data) => {
      console.log('Created rate card:', data);
    },
    onError: (error) => {
      console.error('Failed:', error.message);
    },
    showToast: true, // Optional, defaults to true
  });

  const { mutate: updateRateCard, isPending: pendingUpdateRateCard } = useUpdateRateCard({
    onSuccess: (data) => {
      console.log('Updated:', data);
    },
  });

  const { mutate: deleteRateCard, isPending: pendingDeleteRateCard } = useDeleteRateCard({
    onSuccess: () => {
      console.log('Deleted successfully');
      setShowDeleteDialog(false);
    },
  });

  const { mutate: duplicateRateCard, isPending: pendingDuplicateRateCard } = useDuplicateRateCard({
    onSuccess: (data) => {
      console.log('Duplicated:', data);
    },
  });

  const filteredCards = rateCards?.filter(card => {
    if (filterProject !== "all" && card.project_id !== filterProject && filterProject !== "org-wide") return false;
    if (filterProject === "org-wide" && card.project_id) return false;
    if (filterStatus === "active" && !card.is_active) return false;
    if (filterStatus === "inactive" && card.is_active) return false;
    return true;
  });

  const handleCreateCard = (newCard: BillingRateCard) => {
    createRateCard({
      name: newCard.name,
      currency: newCard.currency,
      project_id: newCard.project_id, 
      rate_new_annotation: newCard.rate_new_annotation,
      rate_untouched_prediction: newCard.rate_untouched_prediction,
      rate_minor_edit: newCard.rate_minor_edit,
      rate_major_edit: newCard.rate_major_edit,
      rate_class_change: newCard.rate_class_change,
      rate_deletion: newCard.rate_deletion,
      rate_missed_object: newCard.rate_missed_object,
      rate_image_review: newCard.rate_image_review,
      rate_annotation_review: newCard.rate_image_review,
      quality_bonus_threshold: newCard.quality_bonus_threshold,
      quality_bonus_multiplier: newCard.quality_bonus_multiplier,
    });

    setShowCreateDialog(false);
  };

  const handleUpdateCard = (updatedCard: BillingRateCard) => {
    updateRateCard({
      rateCardId: updatedCard.rate_card_id,
      payload: updatedCard
    });
    setShowEditDialog(false);
    setSelectedCard(null);
  };

  const handleDeleteCard = (cardId: string) => {
    deleteRateCard({ rateCardId: cardId, hardDelete: true });
    setShowDeleteDialog(false);
    setSelectedCard(null);
  };

  const handleDuplicate = (card: BillingRateCard) => {
    duplicateRateCard({
      rateCardId: card.rate_card_id,
      payload: {
        new_name: `${card.name} (Copy)`,
      }
    });
  };

  const isLoading = loadingProjects || loadingRateCards
  const isError = errorProjects || errorRateCards
  const disabled = pendingUpdateRateCard || pendingCreateRateCard || pendingDeleteRateCard || pendingDuplicateRateCard

  if (isLoading || isError || !projects || !rateCards) {
    return (
      <QueryState
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        loadingMessage="Loading billing rate ..."
        errorMessage="Failed to fetch Billing Rate. Please try again."
      />
    );
  }

  return (
    <div className="min-h-screen w-full bg-background">
      <div className="px-6 py-8">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Billing Management</h1>
              <p className="text-muted-foreground mt-1">Manage rate cards and view billing reports</p>
            </div>
            <div className="flex gap-2">
              <Link to="/billing/report">
                <Button variant="outline">
                  <DollarSign className="h-4 w-4 mr-2" />
                  View Report
                </Button>
              </Link>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Rate Card
              </Button>
            </div>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">Project</label>
                  <Select value={filterProject} onValueChange={setFilterProject}>
                    <SelectTrigger>
                      <SelectValue placeholder="All projects" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Projects</SelectItem>
                      <SelectItem value="org-wide">Organization-Wide Only</SelectItem>
                      {projects?.map(project => (
                        <SelectItem key={project.project_id} value={project.project_id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">Status</label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active Only</SelectItem>
                      <SelectItem value="inactive">Inactive Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rate Cards List */}
          <div className="grid gap-4">
            {filteredCards?.map(card => (
              <Card key={card.rate_card_id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle>{card.name}</CardTitle>
                        <Badge variant={card.is_active ? "default" : "secondary"}>
                          {card.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <CardDescription className="mt-1">
                        {card.project_name ? (
                          <>Project: {card.project_name}</>
                        ) : (
                          <>Organization-Wide</>
                        )}
                        {" • "}
                        Currency: {card.currency}
                        {" • "}
                        Created by {card.created_by_username} on {new Date(card.created_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        disabled={disabled}
                        onClick={() => handleDuplicate(card)}
                      >
                        Duplicate
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        disabled={disabled}
                        onClick={() => {
                          setSelectedCard(card);
                          setShowEditDialog(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        disabled={disabled}
                        onClick={() => {
                          setSelectedCard(card);
                          setShowDeleteDialog(true);
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Annotation Rates</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">New Annotation:</span>
                          <span className="font-medium">${card.rate_new_annotation}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Untouched Prediction:</span>
                          <span className="font-medium">${card.rate_untouched_prediction}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Missed Object:</span>
                          <span className="font-medium">${card.rate_missed_object}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Edit Rates</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Minor Edit:</span>
                          <span className="font-medium">${card.rate_minor_edit}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Major Edit:</span>
                          <span className="font-medium">${card.rate_major_edit}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Class Change:</span>
                          <span className="font-medium">${card.rate_class_change}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Deletion:</span>
                          <span className="font-medium">${card.rate_deletion}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Review & Quality</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Image Review:</span>
                          <span className="font-medium">${card.rate_image_review}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Annotation Review:</span>
                          <span className="font-medium">${card.rate_annotation_review}</span>
                        </div>
                        {card.quality_bonus_threshold && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Bonus Threshold:</span>
                              <span className="font-medium">{card.quality_bonus_threshold}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Bonus Multiplier:</span>
                              <span className="font-medium">{card.quality_bonus_multiplier}x</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredCards?.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No rate cards found matching the filters.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <CreateRateCardDialog
        projects={projects}
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog}
        onSuccess={handleCreateCard}
      />
      
      {selectedCard && (
        <>
          <EditRateCardDialog 
            open={showEditDialog} 
            onOpenChange={setShowEditDialog}
            rateCard={selectedCard}
            onSuccess={handleUpdateCard}
          />
          <DeleteRateCardDialog 
            open={showDeleteDialog} 
            onOpenChange={setShowDeleteDialog}
            rateCard={selectedCard}
            onSuccess={handleDeleteCard}
          />
        </>
      )}
    </div>
  );
}
