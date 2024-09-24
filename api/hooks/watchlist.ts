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

const removeCarFromStock = async (
  url: string,
  { arg }: { arg: { carId: string; token: string | null } }
) => {
  const response = await fetch(`${url}/delete_from_stock`, {
    method: "POST",
    headers: {
      "Content-type": "application/json; charset=UTF-8",
      Authorization: `Bearer ${arg.token}`,
    },
    body: JSON.stringify({ carId: arg.carId }),
  });

  return response.json();
};

const addCarToWatchlist = async (
  url: string,
  { arg }: { arg: { carId: string; token: string; userId: string | undefined } }
) => {
  const fetchUrl = `${url}${arg.carId}/${arg.userId ? `${arg.userId}/follow` : "follow"}`;
  const response = await fetch(fetchUrl, {
    method: "POST",
    headers: {
      "Content-type": "application/json; charset=UTF-8",
      Authorization: `Bearer ${arg.token}`,
    },
  });

  return response.json();
};

const markCarAsSeen = async (url: string, { arg }: { arg: { carId: string; token: string } }) => {
  const fetchUrl = `${url}${arg.carId}/seen`;
  const response = await fetch(fetchUrl, {
    method: "POST",
    headers: {
      "Content-type": "application/json; charset=UTF-8",
      Authorization: `Bearer ${arg.token}`,
    },
  });

  return response.json();
};

export function useGetWatchlist(
  context: CarsListContext,
  orderBy: string = "dateCreate",
  orderDirection: string = "desc",
  orgId: string | undefined = undefined,
  initialPage: number = 1,
  limit: number = 35
) {
  const { token } = useAuth();
  const [page, setPage] = useState(initialPage);
  const [cars, setCars] = useState<any[]>([]);

  let fetchUrl = `${process.env.EXPO_PUBLIC_API_BASE_URL}/car/${context}?from=${
    (page - 1) * limit
  }&limit=${limit}&order_by=${orderBy}&order_direction=${orderDirection}`;

  if (orgId && context === "search") {
    fetchUrl += `&count=false&includeSeen=false&organisationId=${orgId}`;
  }

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

export function useGetOrgCars(
  context: CarsListContext,
  orderBy: string = "dateCreate",
  orderDirection: string = "desc",
  orgId: string | undefined = undefined,
  initialPage: number = 1,
  limit: number = 10
) {
  const { token } = useAuth();
  const [page, setPage] = useState(initialPage);
  const [cars, setCars] = useState<any[]>([]);

  let fetchUrl = `${process.env.EXPO_PUBLIC_API_BASE_URL}/car/${context}?from=${
    (page - 1) * limit
  }&limit=${limit}&order_by=${orderBy}&order_direction=${orderDirection}`;

  if (orgId && context === "search") {
    fetchUrl += `&count=false&includeSeen=false&organisationId=${orgId}`;
  }

  const { data, error, isLoading, mutate, isValidating } = useSWR(
    token ? [fetchUrl, token] : null,
    ([url, token]) => getCarsInWatchlist(url, { arg: { token } }),
    { revalidateOnFocus: false }
  );

  useEffect(() => {
    if (data?.data && data.data.cars) {
      if (page === 1) {
        setCars(data.data.cars);
      } else {
        setCars((prevCars) => [...prevCars, ...data.data.cars]);
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
    `${process.env.EXPO_PUBLIC_API_BASE_URL}/car/`,
    removeCarFromWatchlist
  );

  return {
    trigger,
    newCars: data,
    isMutating,
    error,
  };
}

export function useRemoveCarFromStock() {
  const { trigger, data, isMutating, error } = useSWRMutation(
    `${process.env.EXPO_PUBLIC_API_BASE_URL}/car/`,
    removeCarFromStock
  );

  return {
    trigger,
    newCars: data,
    isMutating,
    error,
  };
}

export function useAddCarToWatchlist() {
  const { trigger, data, isMutating, error } = useSWRMutation(
    `${process.env.EXPO_PUBLIC_API_BASE_URL}/car/`,
    addCarToWatchlist
  );

  return {
    trigger,
    newCars: data,
    isMutating,
    error,
  };
}

export function useMarkCarAsSeen() {
  const { trigger, data, isMutating, error } = useSWRMutation(
    `${process.env.EXPO_PUBLIC_API_BASE_URL}/car/`,
    markCarAsSeen
  );

  return {
    trigger,
    newCars: data,
    isMutating,
    error,
  };
}
