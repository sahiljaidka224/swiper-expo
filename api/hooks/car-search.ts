import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import useSWR from "swr";
import useSWRMutation from "swr/dist/mutation";

const getSwiperCars = async (
  url: string,
  {
    arg,
  }: {
    arg: {
      token: string;
      make?: string;
      model?: string;
      fromYear?: string;
      toYear?: string;
      fromPrice?: string;
      toPrice?: string;
      odometer?: string;
      transmission?: string;
      fuelType?: string;
    };
  }
) => {
  if (arg.make) {
    url += `&make=${arg.make}`;
  }

  if (arg.model) {
    url += `&model=${arg.model}`;
  }

  if (arg.fromYear) {
    url += `&yearFrom=${arg.fromYear}`;
  }

  if (arg.toYear) {
    url += `&yearTo=${arg.toYear}`;
  }

  if (arg.fromPrice) {
    url += `&priceFrom=${arg.fromPrice}`;
  }

  if (arg.toPrice) {
    url += `&priceTo=${arg.toPrice}`;
  }

  if (arg.odometer) {
    url += `&odometer=${arg.odometer}`;
  }
  // else {
  //   url += "&odometer=99999999";
  // }

  if (arg.transmission) {
    url += `&transmission=${arg.transmission === "Automatic" ? "auto" : "manual"}`;
  }

  if (arg.fuelType) {
    url += `&fuelType=${arg.fuelType.toLowerCase()}`;
  }

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-type": "application/json; charset=UTF-8",
      Authorization: `Bearer ${arg.token}`,
    },
  });

  return response.json();
};

const fetchMakeList = async (
  url: string,
  { arg }: { arg: { token: string; make?: string; model?: string; year?: string } }
) => {
  if (arg.make) {
    url += `?make=${arg.make}`;
  }

  if (arg.model || arg.year) {
    if (arg.make) {
      url += `&model=${arg.model ? arg.model : ""}&year=${arg.year ? arg.year : "all"}`;
    }
  }
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${arg.token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch make list");
  }

  return response.json();
};

const getManualSearch = async (
  url: string,
  { arg }: { arg: { token: string; searchTerm: string } }
) => {
  if (arg.searchTerm) {
    url += `?keyword=${encodeURIComponent(arg.searchTerm)}`;
  }
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-type": "application/json; charset=UTF-8",
      Authorization: `Bearer ${arg.token}`,
    },
  });

  return response.json();
};

export const useMakeList = () => {
  const { token } = useAuth();
  const fetchUrl = `${process.env.EXPO_PUBLIC_API_BASE_URL}/cardb`;
  const { data, error, isLoading } = useSWR(token ? [fetchUrl, token] : null, ([url, token]) =>
    fetchMakeList(url, { arg: { token } })
  );

  return {
    makeList: data?.data ?? [],
    loading: isLoading,
    error,
  };
};

export const useModelList = () => {
  const { trigger, isMutating, data, error } = useSWRMutation(
    `${process.env.EXPO_PUBLIC_API_BASE_URL}/cardb`,
    fetchMakeList
  );

  return {
    isMutating,
    modelsData: data?.data ?? [],
    modelError: error,
    triggerModelFetch: trigger,
  };
};

export const useCarYear = () => {
  const {
    trigger: triggerCarYearFetch,
    isMutating,
    data,
    error,
  } = useSWRMutation(`${process.env.EXPO_PUBLIC_API_BASE_URL}/cardb`, fetchMakeList);

  return {
    isCarYearLoading: isMutating,
    carYearData: data?.data ?? [],
    carYearError: error,
    triggerCarYearFetch,
  };
};

export function useSearchCarsCount() {
  const fetchUrl = `${process.env.EXPO_PUBLIC_API_BASE_URL}/car/search?count=true&includeSeen=false`;
  const { trigger, data, error, isMutating } = useSWRMutation(fetchUrl, getSwiperCars);

  return {
    getCarsCount: trigger,
    cars: data?.data?.cars ?? [],
    isMutating,
    error,
  };
}

export function useSearchCars(
  make: string | undefined = undefined,
  model: string | undefined = undefined,
  fromYear: string | undefined = undefined,
  toYear: string | undefined = undefined,
  fromPrice: string | undefined = undefined,
  toPrice: string | undefined = undefined,
  odometer: string | undefined = undefined,
  transmission: string | undefined = undefined,
  fuelType: string | undefined = undefined,
  orderBy: string = "dateCreate",
  orderDirection: string = "desc",
  initialPage: number = 1,
  limit: number = 10
) {
  const { token } = useAuth();
  const [page, setPage] = useState(initialPage);
  const [cars, setCars] = useState<any[]>([]);

  let fetchUrl = `${
    process.env.EXPO_PUBLIC_API_BASE_URL
  }/car/search?count=false&includedSeen=false&from=${
    (page - 1) * limit
  }&limit=${limit}&order_by=${orderBy}&order_direction=${orderDirection}`;

  if (make) {
    fetchUrl += `&make=${make}`;
  }

  if (model) {
    fetchUrl += `&model=${model}`;
  }

  if (fromYear) {
    fetchUrl += `&yearFrom=${fromYear}`;
  }

  if (toYear) {
    fetchUrl += `&yearTo=${toYear}`;
  }

  if (fromPrice) {
    fetchUrl += `&priceFrom=${fromPrice}`;
  }

  if (toPrice) {
    fetchUrl += `&priceTo=${toPrice}`;
  }

  if (odometer) {
    fetchUrl += `&odometer=${odometer}`;
  }

  if (transmission) {
    fetchUrl += `&transmission=${transmission === "Automatic" ? "auto" : "manual"}`;
  }

  if (fuelType) {
    fetchUrl += `&fuelType=${fuelType.toLowerCase()}`;
  }

  const { data, error, isLoading, mutate, isValidating } = useSWR(
    token ? [fetchUrl, token] : null,
    ([url, token]) => getSwiperCars(url, { arg: { token } }),
    { revalidateOnFocus: false }
  );

  useEffect(() => {
    if (data?.data && data?.data?.cars) {
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

export const useManualSearch = (initialPage: number = 1, limit: number = 10) => {
  // const { token } = useAuth();
  // const [page, setPage] = useState(initialPage);
  // const [cars, setCars] = useState<any[]>([]);
  // const [organisations, setOrganisations] = useState<any[]>([]);

  let fetchUrl = `${process.env.EXPO_PUBLIC_API_BASE_URL}/search`;

  const { trigger, data, error, isMutating } = useSWRMutation(fetchUrl, getManualSearch);
  return {
    triggerManualSearch: trigger,
    isMutating,
    cars: data?.data?.cars ?? [],
    organisations: data?.data?.organisations ?? [],
  };
};
