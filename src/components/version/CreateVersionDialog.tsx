import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  CustomDialog, 
  CustomDialogContent, 
  CustomDialogHeader, 
  CustomDialogTitle, 
  CustomDialogDescription, 
  CustomDialogFooter 
} from "@/components/common/CustomDialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/ui/form";
import { Button } from "@/components/ui/ui/button";
import { Input } from "@/components/ui/ui/input";
import { Textarea } from "@/components/ui/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/ui/select";
import { DatasetVersion } from "@/types/version";
import { useToast } from "@/hooks/use-toast";
import { useCreateProjectVersion, useUpdateProjectVersion } from "@/hooks/useDatasetVersions";

const versionSchema = z.object({
  version_name: z
    .string()
    .trim()
    .min(1, "Version name is required")
    .max(100, "Version name must be less than 100 characters"),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
  export_format: z.enum(["yolo", "coco", "pascal_voc", "tfrecord", "custom"]),
  // export_config: z.record,
});

type VersionFormData = z.infer<typeof versionSchema>;


interface CreateVersionDialogProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editVersion?: DatasetVersion | null;
}

export function CreateVersionDialog({ projectId, open, onOpenChange, editVersion }: CreateVersionDialogProps) {
  const { toast } = useToast();
  const { mutateAsync: createVersion, isPending: isCreating } = useCreateProjectVersion(projectId!);
  const { mutateAsync: updateVersion, isPending: isUpdating } = useUpdateProjectVersion(projectId!);


  const form = useForm<VersionFormData>({
    resolver: zodResolver(versionSchema),
    defaultValues: {
      version_name: "",
      description: "",
      export_format: "yolo",
    },
  });

  useEffect(() => {
    if (open) {
      if (editVersion) {
        form.reset({
          version_name: editVersion.version_name,
          description: editVersion.description || "",
          export_format: editVersion.export_format as "yolo" | "coco" | "pascal_voc" | "tfrecord" | "custom",
        });
      } else {
        form.reset({
          version_name: "",
          description: "",
          export_format: "yolo",
        });
      }
    }

  }, [open, editVersion, form]);

 const handleSubmit = async (data: VersionFormData) => {
    try {
      if (editVersion) {
        await updateVersion({
          versionId: editVersion.version_id,
          data: {
            version_name: data.version_name,
            description: data.description,
          }
        });
        toast({
          title: "Version Updated",
          description: `Dataset version "${data.version_name}" has been updated successfully.`,
        });
      } else {
        await createVersion({
          version_name: data.version_name,
          description: data.description,
          export_format: data.export_format,
          // export_config: data.export_config,
        });
        toast({
          title: "Version Created",
          description: `Dataset version "${data.version_name}" has been created successfully.`,
        });
      }
      
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${editVersion ? 'update' : 'create'} version. Please try again.`,
        variant: "destructive",
      });
    }
  }

  const isLoading = isCreating || isUpdating;

  return (
    <CustomDialog open={open} onOpenChange={onOpenChange}>
      <CustomDialogContent className="sm:max-w-[500px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <CustomDialogHeader>
              <CustomDialogTitle>{editVersion ? 'Edit Version' : 'Create New Version'}</CustomDialogTitle>
              <CustomDialogDescription>
                {editVersion 
                  ? 'Update the version details below.'
                  : 'Create a new dataset version snapshot for training.'}
              </CustomDialogDescription>
            </CustomDialogHeader>

            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="version_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Version Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., v1.0-release"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Brief description of this version..."
                        rows={3}
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="export_format"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Export Format *</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                      disabled={isLoading || !!editVersion}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="yolo">YOLO</SelectItem>
                        <SelectItem value="coco">COCO</SelectItem>
                        <SelectItem value="pascal_voc">Pascal VOC</SelectItem>
                        <SelectItem value="tfrecord">TFRecord</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {!editVersion && (
                <div className="rounded-lg bg-muted p-4 text-sm">
                  <p className="font-medium mb-2">Next Steps:</p>
                  <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                    <li>Add images to this version from the project dataset</li>
                    <li>Assign images to train/val/test splits</li>
                    <li>Trigger export to generate dataset files</li>
                  </ol>
                </div>
              )}
            </div>

            <CustomDialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : editVersion ? 'Update' : 'Create'} Version
              </Button>
            </CustomDialogFooter>
          </form>
        </Form>
      </CustomDialogContent>
    </CustomDialog>
  );
}