import { useAuth } from "@/context/AuthContext";
import useSWR from "swr";

const fetchMakeList = async (url: string, { arg }: { arg: { token: string } }) => {
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
