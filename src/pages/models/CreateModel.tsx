import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/ui/button";
import { Card, CardContent } from "@/components/ui/ui/card";
import { toast } from "sonner";
import ModelBasicInfo from "@/components/models/create/ModelBasicInfo";
import ModelFrameworkSelection from "@/components/models/create/ModelFrameworkSelection";
import ModelAdvancedConfig from "@/components/models/create/ModelAdvancedConfig";
import ModelReview from "@/components/models/create/ModelReview";
import { ModelFormData, useCreateModel } from "@/hooks/useModels";

const CreateModel: React.FC = () => {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createModel = useCreateModel({
    onSuccess: (model) => console.log('Created:', model.id)
  });
  
  const [formData, setFormData] = useState<ModelFormData>({
    name: "",
    description: "",
    task: "",
    framework: "",
    tags: [],
    config: {
      batchSize: 32,
      learningRate: 0.001,
      epochs: 100,
      optimizer: "adam",
      scheduler: "cosine"
    }
  });

  const steps = [
    { number: 1, title: "Basic Info", description: "Name and description" },
    { number: 2, title: "Task & Framework", description: "Select model type" },
    { number: 3, title: "Configuration", description: "Training parameters" },
    { number: 4, title: "Review", description: "Confirm details" }
  ];

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Simulate API call with mock data
    // Trigger the mutation
    createModel.mutate({
      projectId:projectId!,
      request: {
        name: formData.name,
        description: formData.description || undefined,
        task: formData.task,
        framework: formData.framework,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
        config: formData.config
      },
    });
    
    toast.success("Model created successfully!", {
      description: `${formData.name} is ready for training.`
    });
    
    setIsSubmitting(false);
    navigate(`/projects/${projectId}/models`);
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.name.trim() !== "";
      case 2:
        return formData.task !== "" && formData.framework !== "";
      case 3:
        return true; // Config has defaults
      case 4:
        return true;
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <ModelBasicInfo formData={formData} setFormData={setFormData} />;
      case 2:
        return <ModelFrameworkSelection formData={formData} setFormData={setFormData} />;
      case 3:
        return <ModelAdvancedConfig formData={formData} setFormData={setFormData} />;
      case 4:
        return <ModelReview formData={formData} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6">
      <div className="mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/projects/${projectId}/models`)}
            className="hover:bg-primary/10"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Create New Model
              </h1>
              <Sparkles className="h-6 w-6 text-accent animate-pulse" />
            </div>
            <p className="text-muted-foreground mt-1">
              Set up a new machine learning model for your project
            </p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="relative">
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted" />
          <div 
            className="absolute top-5 left-0 h-0.5 bg-gradient-to-r from-primary to-accent transition-all duration-500"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          />
          <div className="relative flex justify-between">
            {steps.map((step) => (
              <div key={step.number} className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                    currentStep > step.number
                      ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg shadow-primary/25"
                      : currentStep === step.number
                      ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {currentStep > step.number ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    step.number
                  )}
                </div>
                <div className="mt-3 text-center">
                  <p className={`text-sm font-medium ${
                    currentStep >= step.number ? "text-foreground" : "text-muted-foreground"
                  }`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-muted-foreground hidden sm:block">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="min-h-[400px]">
              {renderStepContent()}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-8 mt-8 border-t border-border/50">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="px-6"
              >
                Previous
              </Button>
              
              {currentStep === steps.length ? (
                <Button
                  onClick={handleSubmit}
                  disabled={!isStepValid() || isSubmitting}
                  className="px-8 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Create Model
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={!isStepValid()}
                  className="px-8 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
                >
                  Continue
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateModel;
