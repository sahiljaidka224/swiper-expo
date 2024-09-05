import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import useSWR from "swr";

const getSwiperCars = async (url: string, { arg }: { arg: { token: string } }) => {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-type": "application/json; charset=UTF-8",
      Authorization: `Bearer ${arg.token}`,
    },
  });

  return response.json();
};

export function useGetSwiperCars(initialPage: number = 1, limit: number = 5) {
  const { user, token } = useAuth();
  const [page, setPage] = useState(initialPage);
  const from = page * limit;

  const fetchUrl = `https://backend-swiper.datalinks.nl/car/swiper?count=false&noOrganisationId=${
    user?.org?.id
  }&includeSeen=false${from > 5 ? `&from=${from}` : ""}`;
  const { data, error, isLoading, mutate, isValidating } = useSWR(
    token ? [fetchUrl, token] : null,
    ([url, token]) => getSwiperCars(url, { arg: { token } })
  );

  const refresh = () => mutate();
  const fetchMore = (newPage: number) => {
    setPage(newPage);
    mutate();
  };

  return {
    cars: data?.data ?? [],
    isLoading,
    error,
    refresh,
    fetchMore,
    isValidating,
  };
}
