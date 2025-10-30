// hooks/useOrganizationDetails.ts

import { useQuery } from "@tanstack/react-query";
import { baseURL } from "@/components/api/base";
import { authStorage } from "@/services/authService";
import { AUTH_STORAGE_KEYS } from "@/types/auth";
import { User } from "@/types/auth";
import { useCurrentOrganization } from "@/hooks/useAuthHelpers";

/**
 * Organization details type
 */
export interface OrganizationDetails {
  id: string;
  org_id: string;
  name: string;
  slug: string;
  description: string;
  website: string;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
  current_user_role: string;
  current_user_status: string;
  current_user_joined_at: string;
  statistics: {
    total_members: number;
    active_members: number;
    inactive_members: number;
    pending_members: number;
    total_projects: number;
    active_projects: number;
    total_images: number;
  };
  recent_members: User[];
}

/**
 * Fetch organization details
 */
export const fetchOrganizationDetails = async (
  organizationId: string
): Promise<OrganizationDetails> => {
  const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);

  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(`${baseURL}/api/v1/organizations/details`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Organization-ID': organizationId,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch organization details");
  }

  return response.json();
};

/**
 * Hook to fetch organization details
 */
export const useOrganizationDetails = () => {
  const { currentOrganization } = useCurrentOrganization();

  return useQuery({
    queryKey: ['organizationDetails', currentOrganization?.id],
    queryFn: () => {
      if (!currentOrganization) {
        throw new Error("No organization selected");
      }
      return fetchOrganizationDetails(currentOrganization.id);
    },
    enabled: !!currentOrganization,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// ============================================
// USAGE IN OrganizationSettings.tsx
// ============================================

/*
import { useOrganizationDetails } from '@/hooks/useOrganizationDetails';

export function OrganizationSettings() {
  const { currentOrganization } = useCurrentOrganization();
  const { data: orgDetails, isLoading, error } = useOrganizationDetails();

  const role = currentOrganization?.role;

  const [organization, setOrganization] = useState({
    name: '',
    description: '',
    website: '',
  });

  // Sync with API data
  useEffect(() => {
    if (orgDetails) {
      setOrganization({
        name: orgDetails.name,
        description: orgDetails.description,
        website: orgDetails.website,
      });
    }
  }, [orgDetails]);

  if (role !== 'owner' && role !== 'admin') {
    return <div>No permission</div>;
  }

  if (isLoading) {
    return <Loader2 className="h-8 w-8 animate-spin" />;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <h2>{orgDetails?.name}</h2>
      <p>Members: {orgDetails?.statistics.total_members}</p>
      <p>Projects: {orgDetails?.statistics.total_projects}</p>
      
      {/* Edit form *\/}
      <Input
        value={organization.name}
        onChange={(e) => setOrganization({ ...organization, name: e.target.value })}
      />
    </div>
  );
}
*/