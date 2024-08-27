import { useAuth } from "@/context/AuthContext";
import useSWR from "swr";
import useSWRMutation from "swr/dist/mutation";

const fetchMakeList = async (
  url: string,
  { arg }: { arg: { token: string; make?: string; model?: string; year?: string } }
) => {
  if (arg.make) {
    url += `?make=${arg.make}`;
  }

  if (arg.model || arg.year) {
    if (arg.make) {
      url += `&model=${arg.model ? arg.model : ""}&year=${arg.year ? arg.year : "all"}`;
    }
  }
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${arg.token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch make list");
  }

  return response.json();
};

export const useMakeList = () => {
  const { token } = useAuth();
  const fetchUrl = "https://backend-swiper.datalinks.nl/cardb";
  const { data, error, isLoading } = useSWR(token ? [fetchUrl, token] : null, ([url, token]) =>
    fetchMakeList(url, { arg: { token } })
  );

  return {
    makeList: data?.data ?? [],
    loading: isLoading,
    error,
  };
};

export const useModelList = () => {
  const { trigger, isMutating, data, error } = useSWRMutation(
    "https://backend-swiper.datalinks.nl/cardb",
    fetchMakeList
  );

  return {
    isMutating,
    modelsData: data?.data ?? [],
    modelError: error,
    triggerModelFetch: trigger,
  };
};

export const useCarYear = () => {
  const {
    trigger: triggerCarYearFetch,
    isMutating,
    data,
    error,
  } = useSWRMutation("https://backend-swiper.datalinks.nl/cardb", fetchMakeList);

  return {
    isCarYearLoading: isMutating,
    carYearData: data?.data ?? [],
    carYearError: error,
    triggerCarYearFetch,
  };
};
