import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import useSWR from "swr";

const getCarDetails = async (url: string, { arg }: { arg: { token: string } }) => {
  const response = await fetch(`${url}`, {
    method: "GET",
    headers: {
      "Content-type": "application/json; charset=UTF-8",
      Authorization: `Bearer ${arg.token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch car details");
  }

  return response.json();
};

const getCarDetailsFromNedVis = async (url: string, { arg }: { arg: { token: string } }) => {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-type": "application/json; charset=UTF-8",
      Authorization: `Bearer ${arg.token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch car details");
  }

  try {
    const responseData = await response.json();
    const nestedDataString = responseData?.data;
    const nestedData = JSON.parse(nestedDataString);
    const carDetails = nestedData?.data?.nevdisPlateSearch_v2;
    return carDetails;
  } catch (error) {
    console.log({ error });
    return null;
  }
};

export function useGetCarDetails(carId: string) {
  const { token } = useAuth();
  const fetchUrl = `${process.env.EXPO_PUBLIC_API_BASE_URL}/car/${carId}`;
  const { data, error, isLoading } = useSWR(
    carId && token ? [fetchUrl, token] : null,
    ([url, token]) => getCarDetails(url, { arg: { token } })
  );

  return {
    car: data?.data?.car ?? null,
    isLoading,
    error,
  };
}

export const useCarDetailsFromNedVis = () => {
  const { token } = useAuth();
  const [state, setState] = useState<{ rego: string; state: string }>();
  const fetchUrl = state
    ? `${process.env.EXPO_PUBLIC_API_BASE_URL}/offers/cardetailsnedvis/${state.rego}/${state.state}`
    : "";

  const { data, error, isLoading } = useSWR(
    token ? [fetchUrl, token] : null,
    ([url, token]) => getCarDetailsFromNedVis(url, { arg: { token } }),
    {
      revalidateOnFocus: false,
    }
  );

  const fetchCarDetails = (rego: string, state: string) => {
    setState({ rego, state });
  };

  return {
    carData: data ?? [],
    loading: isLoading,
    error,
    fetchCarDetails,
  };
};
