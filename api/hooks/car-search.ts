import useSWR from "swr";

const fetchMakeList = async () => {
  const response = await fetch("https://backend-swiper.datalinks.nl/cardb", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization:
        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyVVVJRCI6IjRkMzA2NjcwLWU3MzMtMTFlZS05NWJiLWQ5MGI4ZGJkMjQzZCIsImlhdCI6MTcxNzk4NjYzOSwiZXhwIjoxNzQ5NTIyNjM5fQ.0jvY69fyIhZb-y58lehfQuJzk_armyEHADyvwpBIR1Q",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch make list");
  }

  return response.json();
};

export const useMakeList = () => {
  const { data, error, isLoading } = useSWR("make-list", fetchMakeList, {
    revalidateOnFocus: false,
  });

  return {
    makeList: data?.data ?? [],
    loading: isLoading,
    error,
  };
};
