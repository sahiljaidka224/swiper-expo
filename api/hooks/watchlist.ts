import { useState } from "react";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";

const getCarsInWatchlist = async (url: string) => {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-type": "application/json; charset=UTF-8",
      Authorization:
        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyVVVJRCI6IjRkMzA2NjcwLWU3MzMtMTFlZS05NWJiLWQ5MGI4ZGJkMjQzZCIsImlhdCI6MTcxNzk4NjYzOSwiZXhwIjoxNzQ5NTIyNjM5fQ.0jvY69fyIhZb-y58lehfQuJzk_armyEHADyvwpBIR1Q",
    },
  });

  return response.json();
};

const removeCarFromWatchlist = async (url: string, { arg }: { arg: { carId: string } }) => {
  const response = await fetch(`${url}${arg.carId}/follow`, {
    method: "DELETE",
    headers: {
      "Content-type": "application/json; charset=UTF-8",
      Authorization:
        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyVVVJRCI6IjRkMzA2NjcwLWU3MzMtMTFlZS05NWJiLWQ5MGI4ZGJkMjQzZCIsImlhdCI6MTcxNzk4NjYzOSwiZXhwIjoxNzQ5NTIyNjM5fQ.0jvY69fyIhZb-y58lehfQuJzk_armyEHADyvwpBIR1Q",
    },
  });

  return response.json();
};

export function useGetWatchlist(
  context: "stock" | "watchlist",
  initialPage: number = 1,
  limit: number = 35
) {
  const [page, setPage] = useState(initialPage);
  const from = page * limit;
  const { data, error, isLoading, mutate } = useSWR(
    `https://backend-swiper.datalinks.nl/car/${
      context === "watchlist" ? "followed" : "stock"
    }?1=1&from=${from}&order_by=dateCreate&order_direction=desc`,
    getCarsInWatchlist
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
