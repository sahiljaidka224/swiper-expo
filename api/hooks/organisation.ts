import { useAuth } from "@/context/AuthContext";
import useSWR from "swr";

const getOrgDetails = async (url: string, { arg }: { arg: { token: string } }) => {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-type": "application/json; charset=UTF-8",
      Authorization: `Bearer ${arg.token}`,
    },
  });

  return response.json();
};

export function useGetOrgDetails(orgId: string | null) {
  const { token } = useAuth();
  const fetchUrl = `${process.env.EXPO_PUBLIC_API_BASE_URL}/organisation/${orgId}`;
  const { data, error, isLoading } = useSWR(
    token && orgId ? [fetchUrl, token] : null,
    ([url, token]) => getOrgDetails(url, { arg: { token } })
  );

  return {
    org: data?.data ?? null,
    error,
    isLoading,
  };
}
