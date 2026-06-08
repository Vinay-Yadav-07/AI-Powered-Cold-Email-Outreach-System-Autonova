import { useQuery } from "@tanstack/react-query";

const fetchJson = async (url, fallbackMessage) => {
  const response = await fetch(url);
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error || fallbackMessage);
  }

  return data;
};

export const useLeads = (page = 1, limit = 20, filters = {}) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["leads", page, limit, filters],
    queryFn: async () => {
      return fetchJson(
        `/api/leads?page=${page}&limit=${limit}&${new URLSearchParams(filters).toString()}`,
        "Failed to fetch leads",
      );
    },
    keepPreviousData: true,
  });

  return {
    leads: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    error,
    refetch,
  };
};

export const useLead = (id) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["lead", id],
    queryFn: async () => {
      return fetchJson(`/api/leads/${id}`, "Failed to fetch lead");
    },
    enabled: !!id,
  });

  return { lead: data, isLoading, error };
};

export const useDashboardStats = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      return fetchJson("/api/stats", "Failed to fetch stats");
    },
  });

  return { stats: data, isLoading, error };
};

export const useAnalytics = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["analytics"],
    queryFn: async () => {
      return fetchJson("/api/analytics", "Failed to fetch analytics");
    },
  });

  return { analytics: data, isLoading, error };
};

export const useSequencePipeline = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["sequencePipeline"],
    queryFn: async () => {
      return fetchJson("/api/sequences", "Failed to fetch pipeline");
    },
  });

  return { pipeline: data, isLoading, error };
};

export const useActivityLogs = (page = 1, limit = 20) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["activityLogs", page, limit],
    queryFn: async () => {
      return fetchJson(`/api/logs?page=${page}&limit=${limit}`, "Failed to fetch logs");
    },
  });

  return {
    logs: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    error,
  };
};

export const useUnsubscribedLeads = (page = 1, limit = 20) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["unsubscribedLeads", page, limit],
    queryFn: async () => {
      return fetchJson(
        `/api/leads/unsubscribed?page=${page}&limit=${limit}`,
        "Failed to fetch unsubscribed leads",
      );
    },
  });

  return {
    leads: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    error,
  };
};
