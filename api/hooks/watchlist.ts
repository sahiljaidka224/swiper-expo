import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";

const getCarsInWatchlist = async (url: string, { arg }: { arg: { token: string } }) => {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-type": "application/json; charset=UTF-8",
      Authorization: `Bearer ${arg.token}`,
    },
  });

  return response.json();
};

const removeCarFromWatchlist = async (
  url: string,
  { arg }: { arg: { carId: string; token: string | null } }
) => {
  const response = await fetch(`${url}${arg.carId}/follow`, {
    method: "DELETE",
    headers: {
      "Content-type": "application/json; charset=UTF-8",
      Authorization: `Bearer ${arg.token}`,
    },
  });

  return response.json();
};

export function useGetWatchlist(
  context: "stock" | "watchlist",
  orderBy: string = "dateCreate",
  orderDirection: string = "desc",
  initialPage: number = 1,
  limit: number = 35
) {
  const { token } = useAuth();
  const [page, setPage] = useState(initialPage);
  const [cars, setCars] = useState<any[]>([]);

  const fetchUrl = `https://backend-swiper.datalinks.nl/car/${
    context === "watchlist" ? "followed" : "stock"
  }?from=${
    (page - 1) * limit
  }&limit=${limit}&order_by=${orderBy}&order_direction=${orderDirection}`;

  const { data, error, isLoading, mutate, isValidating } = useSWR(
    token ? [fetchUrl, token] : null,
    ([url, token]) => getCarsInWatchlist(url, { arg: { token } }),
    { revalidateOnFocus: false }
  );

  useEffect(() => {
    if (data?.data) {
      if (page === 1) {
        setCars(data.data);
      } else {
        setCars((prevCars) => [...prevCars, ...data.data]);
      }
    }
  }, [data, page]);

  const refresh = () => {
    setPage(1);
    mutate();
  };

  const fetchMore = () => {
    setPage((prevPage) => prevPage + 1);
  };

  return {
    isValidating,
    cars,
    isLoading,
    error,
    refresh,
    fetchMore,
  };
}

export function useRemoveCarFromWatchlist() {
  const { trigger, data, isMutating, error } = useSWRMutation(
    "https://backend-swiper.datalinks.nl/car/",
    removeCarFromWatchlist
  );

  return {
    trigger,
    newCars: data,
    isMutating,
    error,
  };
}
