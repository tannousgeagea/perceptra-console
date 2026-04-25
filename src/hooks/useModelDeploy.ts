import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { baseURL } from "@/components/api/base";
import { authStorage } from "@/services/authService";
import { AUTH_STORAGE_KEYS } from "@/types/auth";
import { useCurrentOrganization } from "@/hooks/useAuthHelpers";
import { toast } from "sonner";
import { ModelEvaluation, ModelEvaluationList, RetrainingPolicy, RetrainingPolicyCreate } from "@/types/models";

const authHeaders = (orgId: string) => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
  return {
    Authorization: `Bearer ${token}`,
    "X-Organization-ID": orgId,
    "Content-Type": "application/json",
  };
};

// ── Deploy / Undeploy ────────────────────────────────────────────────────────

export const deployModelVersion = async (
  orgId: string,
  versionId: string,
  targetEnv: "staging" | "production" = "production"
) => {
  const resp = await fetch(`${baseURL}/api/v1/model-versions/${versionId}/deploy`, {
    method: "POST",
    headers: authHeaders(orgId),
    body: JSON.stringify({ target_env: targetEnv }),
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err.detail || "Deploy failed");
  }
  return resp.json();
};

export const undeployModelVersion = async (orgId: string, versionId: string) => {
  const resp = await fetch(`${baseURL}/api/v1/model-versions/${versionId}/undeploy`, {
    method: "POST",
    headers: authHeaders(orgId),
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err.detail || "Undeploy failed");
  }
  return resp.json();
};

export const useDeployVersion = () => {
  const queryClient = useQueryClient();
  const { currentOrganization } = useCurrentOrganization();
  return useMutation({
    mutationFn: ({ versionId, targetEnv }: { versionId: string; targetEnv: "staging" | "production" }) =>
      deployModelVersion(currentOrganization!.id, versionId, targetEnv),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["modelDetail"] });
      toast.success("Model deployed successfully");
    },
    onError: (err: Error) => toast.error(err.message || "Deploy failed"),
  });
};

export const useUndeployVersion = () => {
  const queryClient = useQueryClient();
  const { currentOrganization } = useCurrentOrganization();
  return useMutation({
    mutationFn: (versionId: string) =>
      undeployModelVersion(currentOrganization!.id, versionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["modelDetail"] });
      toast.success("Model undeployed");
    },
    onError: (err: Error) => toast.error(err.message || "Undeploy failed"),
  });
};

// ── Evaluations ──────────────────────────────────────────────────────────────

export const fetchModelEvaluations = async (
  orgId: string,
  modelId: string
): Promise<ModelEvaluationList> => {
  const resp = await fetch(`${baseURL}/api/v1/models/${modelId}/evaluations?limit=20`, {
    headers: authHeaders(orgId),
  });
  if (!resp.ok) throw new Error("Failed to fetch evaluations");
  return resp.json();
};

export const promoteChallenger = async (orgId: string, evaluationId: string) => {
  const resp = await fetch(`${baseURL}/api/v1/model-evaluations/${evaluationId}/promote`, {
    method: "POST",
    headers: authHeaders(orgId),
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err.detail || "Promotion failed");
  }
  return resp.json();
};

export const useModelEvaluations = (modelId: string) => {
  const { currentOrganization } = useCurrentOrganization();
  return useQuery({
    queryKey: ["modelEvaluations", currentOrganization?.id, modelId],
    queryFn: () => fetchModelEvaluations(currentOrganization!.id, modelId),
    enabled: !!currentOrganization && !!modelId,
    staleTime: 30 * 1000,
  });
};

export const usePromoteChallenger = () => {
  const queryClient = useQueryClient();
  const { currentOrganization } = useCurrentOrganization();
  return useMutation({
    mutationFn: (evaluationId: string) =>
      promoteChallenger(currentOrganization!.id, evaluationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["modelEvaluations"] });
      queryClient.invalidateQueries({ queryKey: ["modelDetail"] });
      toast.success("Challenger promoted to production");
    },
    onError: (err: Error) => toast.error(err.message || "Promotion failed"),
  });
};

// ── Retraining Policies ──────────────────────────────────────────────────────

export const fetchRetrainingPolicies = async (
  orgId: string,
  modelId: string
): Promise<{ count: number; results: RetrainingPolicy[] }> => {
  const resp = await fetch(`${baseURL}/api/v1/models/${modelId}/retraining-policies`, {
    headers: authHeaders(orgId),
  });
  if (!resp.ok) throw new Error("Failed to fetch retraining policies");
  return resp.json();
};

export const createRetrainingPolicy = async (
  orgId: string,
  modelId: string,
  data: RetrainingPolicyCreate
): Promise<RetrainingPolicy> => {
  const resp = await fetch(`${baseURL}/api/v1/models/${modelId}/retraining-policies`, {
    method: "POST",
    headers: authHeaders(orgId),
    body: JSON.stringify(data),
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to create policy");
  }
  return resp.json();
};

export const updateRetrainingPolicy = async (
  orgId: string,
  modelId: string,
  policyId: string,
  data: Partial<RetrainingPolicyCreate & { is_active: boolean }>
): Promise<RetrainingPolicy> => {
  const resp = await fetch(
    `${baseURL}/api/v1/models/${modelId}/retraining-policies/${policyId}`,
    {
      method: "PATCH",
      headers: authHeaders(orgId),
      body: JSON.stringify(data),
    }
  );
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to update policy");
  }
  return resp.json();
};

export const deleteRetrainingPolicy = async (
  orgId: string,
  modelId: string,
  policyId: string
): Promise<void> => {
  const resp = await fetch(
    `${baseURL}/api/v1/models/${modelId}/retraining-policies/${policyId}`,
    { method: "DELETE", headers: authHeaders(orgId) }
  );
  if (!resp.ok && resp.status !== 204) throw new Error("Failed to delete policy");
};

export const triggerRetrainingPolicy = async (
  orgId: string,
  modelId: string,
  policyId: string
) => {
  const resp = await fetch(
    `${baseURL}/api/v1/models/${modelId}/retraining-policies/${policyId}/trigger`,
    { method: "POST", headers: authHeaders(orgId) }
  );
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to trigger policy");
  }
  return resp.json();
};

export const useRetrainingPolicies = (modelId: string) => {
  const { currentOrganization } = useCurrentOrganization();
  return useQuery({
    queryKey: ["retrainingPolicies", currentOrganization?.id, modelId],
    queryFn: () => fetchRetrainingPolicies(currentOrganization!.id, modelId),
    enabled: !!currentOrganization && !!modelId,
    staleTime: 60 * 1000,
  });
};

export const useCreateRetrainingPolicy = (modelId: string) => {
  const queryClient = useQueryClient();
  const { currentOrganization } = useCurrentOrganization();
  return useMutation({
    mutationFn: (data: RetrainingPolicyCreate) =>
      createRetrainingPolicy(currentOrganization!.id, modelId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["retrainingPolicies"] });
      toast.success("Retraining policy created");
    },
    onError: (err: Error) => toast.error(err.message),
  });
};

export const useUpdateRetrainingPolicy = (modelId: string) => {
  const queryClient = useQueryClient();
  const { currentOrganization } = useCurrentOrganization();
  return useMutation({
    mutationFn: ({
      policyId,
      data,
    }: {
      policyId: string;
      data: Partial<RetrainingPolicyCreate & { is_active: boolean }>;
    }) => updateRetrainingPolicy(currentOrganization!.id, modelId, policyId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["retrainingPolicies"] });
      toast.success("Policy updated");
    },
    onError: (err: Error) => toast.error(err.message),
  });
};

export const useDeleteRetrainingPolicy = (modelId: string) => {
  const queryClient = useQueryClient();
  const { currentOrganization } = useCurrentOrganization();
  return useMutation({
    mutationFn: (policyId: string) =>
      deleteRetrainingPolicy(currentOrganization!.id, modelId, policyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["retrainingPolicies"] });
      toast.success("Policy deleted");
    },
    onError: (err: Error) => toast.error(err.message),
  });
};

export const useTriggerRetrainingPolicy = (modelId: string) => {
  const { currentOrganization } = useCurrentOrganization();
  return useMutation({
    mutationFn: (policyId: string) =>
      triggerRetrainingPolicy(currentOrganization!.id, modelId, policyId),
    onSuccess: () => toast.success("Retraining triggered"),
    onError: (err: Error) => toast.error(err.message),
  });
};
