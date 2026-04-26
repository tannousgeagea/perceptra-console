import React from "react";
import { UseFormReturn } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage,
  FormControl,
} from "@/components/ui/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/ui/select";
import { Skeleton } from "@/components/ui/ui/skeleton";
import { Badge } from "@/components/ui/ui/badge";
import { useComputeProfiles } from "@/hooks/useCompute";
import { useAgents } from "@/hooks/useAgents";

interface ComputeTabProps {
  form: UseFormReturn<any>;
  isTraining: boolean;
}

const ComputeTab: React.FC<ComputeTabProps> = ({ form, isTraining }) => {
  const { data: profiles = [], isLoading: profilesLoading } = useComputeProfiles();

  const selectedProfileId = form.watch("computeProfileId");
  const selectedProfile = profiles.find((p) => p.id === selectedProfileId);
  const isOnPremise = selectedProfile?.provider.provider_type === "on-premise-agent";

  const { data: agents = [], isLoading: agentsLoading } = useAgents(
    { status: "ready" },
    { pollingInterval: false }
  );

  if (profilesLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-4 w-48" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="computeProfileId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Compute Profile</FormLabel>
            <FormControl>
              <Select
                value={field.value ?? ""}
                onValueChange={(val) => {
                  field.onChange(val);
                  form.setValue("agentId", "");
                }}
                disabled={isTraining}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a compute profile" />
                </SelectTrigger>
                <SelectContent>
                  {profiles.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-muted-foreground">
                      No compute profiles configured
                    </div>
                  ) : (
                    profiles.map((profile) => (
                      <SelectItem key={profile.id} value={profile.id}>
                        <div className="flex items-center gap-2">
                          <span>{profile.name}</span>
                          {profile.is_default && (
                            <Badge variant="secondary" className="text-xs">default</Badge>
                          )}
                          <span className="text-muted-foreground text-xs">
                            {profile.provider.name}
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </FormControl>
            {selectedProfile && (
              <FormDescription>
                {selectedProfile.provider.provider_type.replace(/-/g, " ")}
                {selectedProfile.default_instance_type
                  ? ` · ${selectedProfile.default_instance_type}`
                  : ""}
              </FormDescription>
            )}
            <FormMessage />
          </FormItem>
        )}
      />

      {isOnPremise && (
        <FormField
          control={form.control}
          name="agentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Agent</FormLabel>
              <FormControl>
                {agentsLoading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Select
                    value={field.value ?? ""}
                    onValueChange={field.onChange}
                    disabled={isTraining}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an agent" />
                    </SelectTrigger>
                    <SelectContent>
                      {agents.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-muted-foreground">
                          No ready agents available
                        </div>
                      ) : (
                        agents.map((agent) => (
                          <SelectItem key={agent.agent_id} value={agent.agent_id}>
                            <div className="flex items-center gap-2">
                              <span
                                className={`h-2 w-2 rounded-full ${
                                  agent.is_online ? "bg-green-500" : "bg-muted-foreground"
                                }`}
                              />
                              <span>{agent.name}</span>
                              {agent.gpu_count > 0 && (
                                <span className="text-muted-foreground text-xs">
                                  {agent.gpu_count} GPU{agent.gpu_count > 1 ? "s" : ""}
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                )}
              </FormControl>
              <FormDescription>
                Choose which on-premise agent runs this training job
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
};

export default ComputeTab;
