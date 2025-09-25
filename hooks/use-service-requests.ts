import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import {
  ServiceRequest,
  ServiceCategory,
  Database,
} from "@/lib/database.types";
import { useCurrentUser } from "@/hooks/use-current-user";

type Customer = Database["public"]["Tables"]["customers"]["Row"];
type User = Database["public"]["Tables"]["users"]["Row"];

/**
 * Hook to fetch all service requests with related data (role-based access)
 */
export const useServiceRequests = (query: string = "") => {
  const { data: currentUser } = useCurrentUser();

  return useQuery<ServiceRequest[], Error>({
    queryKey: ["service-requests", query, currentUser?.id, currentUser?.role],
    queryFn: async () => {
      if (!currentUser) {
        throw new Error("User not authenticated");
      }

      let supabaseQuery = supabase
        .from("service_requests")
        .select(
          `
          *,
          customer:customers(*),
          service_category:service_categories(*),
          assigned_technician:users!assigned_technician_id(*),
          created_by_user:users!created_by(*)
        `
        )
        .order("created_at", { ascending: false });

      // Apply role-based filtering
      if (currentUser.role === "technician") {
        // Technicians can only see their assigned requests
        supabaseQuery = supabaseQuery.eq(
          "assigned_technician_id",
          currentUser.id
        );
      }
      // Admin and sales can see all requests (handled by RLS policies)

      if (query) {
        supabaseQuery = supabaseQuery.or(
          `request_number.ilike.%${query}%,title.ilike.%${query}%,description.ilike.%${query}%`
        );
      }

      const { data, error } = await supabaseQuery;

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    },
    enabled: !!currentUser,
  });
};

/**
 * Hook to fetch a single service request with related data
 */
export const useServiceRequest = (id: string | undefined) => {
  return useQuery<ServiceRequest, Error>({
    queryKey: ["service-requests", id],
    queryFn: async () => {
      if (!id) throw new Error("Service request ID is required");

      const { data, error } = await supabase
        .from("service_requests")
        .select(
          `
          *,
          customer:customers(*),
          service_category:service_categories(*),
          assigned_technician:users!assigned_technician_id(*),
          created_by_user:users!created_by(*)
        `
        )
        .eq("id", id)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    enabled: !!id,
  });
};

/**
 * Hook to create a new service request
 */
export const useCreateServiceRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newServiceRequest: Partial<ServiceRequest>) => {
      const { data, error } = await supabase
        .from("service_requests")
        .insert([newServiceRequest])
        .select(
          `
          *,
          customer:customers(*),
          service_category:service_categories(*),
          assigned_technician:users!assigned_technician_id(*),
          created_by_user:users!created_by(*)
        `
        )
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-requests"] });
    },
  });
};

/**
 * Hook to update an existing service request
 */
export const useUpdateServiceRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...serviceRequest
    }: Partial<ServiceRequest> & { id: string }) => {
      const { data, error } = await supabase
        .from("service_requests")
        .update({
          ...serviceRequest,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select(
          `
          *,
          customer:customers(*),
          service_category:service_categories(*),
          assigned_technician:users!assigned_technician_id(*),
          created_by_user:users!created_by(*)
        `
        )
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["service-requests"] });
      queryClient.invalidateQueries({
        queryKey: ["service-requests", variables.id],
      });
    },
  });
};

/**
 * Hook to delete a service request
 */
export const useDeleteServiceRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("service_requests")
        .delete()
        .eq("id", id);

      if (error) {
        throw new Error(error.message);
      }

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-requests"] });
    },
  });
};

/**
 * Hook to fetch service requests by technician
 */
export const useServiceRequestsByTechnician = (
  technicianId: string | undefined
) => {
  return useQuery<ServiceRequest[], Error>({
    queryKey: ["service-requests", "technician", technicianId],
    queryFn: async () => {
      if (!technicianId) throw new Error("Technician ID is required");

      const { data, error } = await supabase
        .from("service_requests")
        .select(
          `
          *,
          customer:customers(*),
          service_category:service_categories(*),
          assigned_technician:users!assigned_technician_id(*),
          created_by_user:users!created_by(*)
        `
        )
        .eq("assigned_technician_id", technicianId)
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    },
    enabled: !!technicianId,
  });
};

/**
 * Hook to fetch service requests by customer
 */
export const useServiceRequestsByCustomer = (
  customerId: string | undefined
) => {
  return useQuery<ServiceRequest[], Error>({
    queryKey: ["service-requests", "customer", customerId],
    queryFn: async () => {
      if (!customerId) throw new Error("Customer ID is required");

      const { data, error } = await supabase
        .from("service_requests")
        .select(
          `
          *,
          customer:customers(*),
          service_category:service_categories(*),
          assigned_technician:users!assigned_technician_id(*),
          created_by_user:users!created_by(*)
        `
        )
        .eq("customer_id", customerId)
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    },
    enabled: !!customerId,
  });
};

/**
 * Hook to update service request status
 */
export const useUpdateServiceRequestStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
      notes,
    }: {
      id: string;
      status: ServiceRequest["status"];
      notes?: string;
    }) => {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      };

      // Set date fields based on status
      if (status === "assigned" && !updateData.assigned_date) {
        updateData.assigned_date = new Date().toISOString();
      } else if (status === "in_progress" && !updateData.started_date) {
        updateData.started_date = new Date().toISOString();
      } else if (status === "completed" && !updateData.completed_date) {
        updateData.completed_date = new Date().toISOString();
      }

      if (notes) {
        updateData.technician_notes = notes;
      }

      const { data, error } = await supabase
        .from("service_requests")
        .update(updateData)
        .eq("id", id)
        .select(
          `
          *,
          customer:customers(*),
          service_category:service_categories(*),
          assigned_technician:users!assigned_technician_id(*),
          created_by_user:users!created_by(*)
        `
        )
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["service-requests"] });
      queryClient.invalidateQueries({
        queryKey: ["service-requests", variables.id],
      });
    },
  });
};

/**
 * Hook to fetch technicians and admins (users who can be assigned to service requests)
 */
export const useTechnicians = () => {
  return useQuery<User[], Error>({
    queryKey: ["technicians"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .in("role", ["technician", "admin"])
        .eq("is_active", true)
        .order("full_name");

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    },
  });
};

/**
 * Hook to fetch service request updates/notes
 */
export const useServiceRequestUpdates = (
  serviceRequestId: string | undefined
) => {
  return useQuery({
    queryKey: ["service-request-updates", serviceRequestId],
    queryFn: async () => {
      if (!serviceRequestId) throw new Error("Service request ID is required");

      const { data, error } = await supabase
        .from("service_request_updates")
        .select(
          `
          *,
          updated_by_user:updated_by(*)
        `
        )
        .eq("service_request_id", serviceRequestId)
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    },
    enabled: !!serviceRequestId,
  });
};

/**
 * Hook to fetch parts used for a service request
 */
export const useServicePartsUsed = (serviceRequestId: string | undefined) => {
  return useQuery({
    queryKey: ["service-parts-used", serviceRequestId],
    queryFn: async () => {
      if (!serviceRequestId) throw new Error("Service request ID is required");

      const { data, error } = await supabase
        .from("service_parts_used")
        .select(
          `
          *,
          product:product_id(*)
        `
        )
        .eq("service_request_id", serviceRequestId)
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    },
    enabled: !!serviceRequestId,
  });
};

/**
 * Hook to add a service request update/note
 */
export const useAddServiceRequestUpdate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (update: {
      service_request_id: string;
      updated_by: string;
      update_type: string;
      title: string;
      description?: string;
      status_from?: string | null;
      status_to?: string | null;
      is_customer_visible?: boolean;
    }) => {
      const { data, error } = await supabase
        .from("service_request_updates")
        .insert([
          {
            ...update,
            created_at: new Date().toISOString(),
          },
        ])
        .select(
          `
          *,
          updated_by_user:updated_by(*)
        `
        )
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["service-request-updates", variables.service_request_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["service-requests", variables.service_request_id],
      });
    },
  });
};
