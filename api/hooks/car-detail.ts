import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import useSWR from "swr";
import useSWRMutation from "swr/dist/mutation";

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

const getCarDetailsFromNedVis = async (
  url: string,
  { arg }: { arg: { token: string; rego: string; state: string } }
) => {
  const response = await fetch(`${url}/${arg.rego}/${arg.state}`, {
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
    if (!carDetails && nestedData?.errors) {
      throw new Error("Unable to fetch car details, please try again!");
    } else if (carDetails && carDetails.length === 0) {
      throw new Error("No car details found for the provided registration number");
    }
    return carDetails;
  } catch (error) {
    throw new Error("Unable to fetch car details, please try again!");
  }
};

export function useGetCarDetails(carId: string | null) {
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
  const [error, setError] = useState<any>(null);

  const {
    trigger,
    data,
    isMutating: loading,
  } = useSWRMutation(
    `${process.env.EXPO_PUBLIC_API_BASE_URL}/offers/cardetailsnedvis`,
    getCarDetailsFromNedVis
  );

  const fetchCarDetails = (rego: string, state: string) => {
    if (!token) return;
    setError(null);
    trigger({ token, rego, state }).catch((error) => {
      setError(error);
    });
  };

  return {
    carData: data ?? [],
    loading,
    error,
    fetchCarDetails,
  };
};
