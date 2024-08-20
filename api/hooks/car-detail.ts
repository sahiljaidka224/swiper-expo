import { useState } from "react";
import useSWR from "swr";

const getCarDetails = async (url: string, carId: string) => {
  const response = await fetch(`${url}${carId}`, {
    method: "GET",
    headers: {
      "Content-type": "application/json; charset=UTF-8",
      Authorization:
        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyVVVJRCI6IjRkMzA2NjcwLWU3MzMtMTFlZS05NWJiLWQ5MGI4ZGJkMjQzZCIsImlhdCI6MTcxNzk4NjYzOSwiZXhwIjoxNzQ5NTIyNjM5fQ.0jvY69fyIhZb-y58lehfQuJzk_armyEHADyvwpBIR1Q",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch car details");
  }

  return response.json();
};

const getCarDetailsFromNedVis = async (url: string) => {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-type": "application/json; charset=UTF-8",
      Authorization:
        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyVVVJRCI6IjRkMzA2NjcwLWU3MzMtMTFlZS05NWJiLWQ5MGI4ZGJkMjQzZCIsImlhdCI6MTcxNzk4NjYzOSwiZXhwIjoxNzQ5NTIyNjM5fQ.0jvY69fyIhZb-y58lehfQuJzk_armyEHADyvwpBIR1Q",
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
  const { data, error, isLoading } = useSWR(
    carId ? [`https://backend-swiper.datalinks.nl/car/`, carId] : null,
    ([url, carId]) => getCarDetails(url, carId)
  );

  return {
    car: data?.data?.car ?? null,
    isLoading,
    error,
  };
}

export const useCarDetailsFromNedVis = () => {
  const [state, setState] = useState<{ rego: string; state: string }>();

  const { data, error, isLoading } = useSWR(
    state
      ? `https://backend-swiper.datalinks.nl/offers/cardetailsnedvis/${state.rego}/${state.state}`
      : null,
    getCarDetailsFromNedVis,
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
