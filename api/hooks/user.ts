import useSWR from "swr";

const getUserDetails = async (url: string) => {
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

export function useGetUserDetails(userId: string) {
  console.log({ userId });
  const { data, error, isLoading } = useSWR(
    `https://backend-swiper.datalinks.nl/user/${userId}`,
    getUserDetails
  );

  return {
    user: data?.data ?? null,
    error,
    isLoading,
  };
}
