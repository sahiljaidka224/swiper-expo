import { useEffect, useState } from "react";
import useSWR from "swr";

const getSwiperCars = async (url: string) => {
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

export function useGetSwiperCars(
  initialPage: number = 1,
  limit: number = 5,
  orgId: string = "tma"
) {
  const [page, setPage] = useState(initialPage);
  const from = page * limit;
  // TODO: update orgId
  const { data, error, isLoading, mutate, isValidating } = useSWR(
    `https://backend-swiper.datalinks.nl/car/swiper?count=false&noOrganisationId=tma&includeSeen=false${
      from > 5 ? `&from=${from}` : ""
    }`,
    getSwiperCars
  );

  console.log("fetch agian");

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
    isValidating
  };
}

export function useGetSwiperCars1(
  initialPage: number = 1,
  limit: number = 5,
  orgId: string = "tma"
) {
  const [page, setPage] = useState(initialPage);
  const [triggerFetch, setTriggerFetch] = useState(false);

  const from = page * limit;

  const fetchData = () => {
    setTriggerFetch(true);
  };

  const { data, error, isLoading, mutate } = useSWR(
    triggerFetch
      ? `https://backend-swiper.datalinks.nl/car/swiper?count=false&noOrganisationId=${orgId}&includeSeen=false${
          from > 5 ? `&from=${from}` : ""
        }`
      : null, // Only trigger SWR when fetchData is called
    getSwiperCars
  );

  useEffect(() => {
    if (data?.data && !isLoading) {
      setTriggerFetch(false)
    }
  }, [data, isLoading])

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
    fetchData, // Expose this to trigger data fetching
  };
}
