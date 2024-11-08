import axios, { RawAxiosRequestHeaders } from "axios";
import { Platform } from "react-native";
import useSWRMutation from "swr/dist/mutation";

const saveToStock = async (
  url: string,
  { arg: { carModel, token } }: { arg: { carModel: any; token: string } }
) => {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-type": "application/json; charset=UTF-8",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(carModel),
  });

  if (!response.ok) {
    throw new Error("Failed to save car to stock");
  }

  return response.json();
};

const updateStock = async (
  url: string,
  { arg: { carModel, token } }: { arg: { carModel: any; token: string } }
) => {
  try {
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(carModel),
    });

    if (!response.ok) {
      console.log({ response });

      throw new Error("Failed to update stock");
    }

    return response.json();
  } catch (error) {
    console.error("Failed to update stock", error);
  }
};

const uploadFilesToStock = async (
  url: string,
  { arg: { formData, token } }: { arg: { formData: FormData; token: string } }
) => {
  try {
    let headers: RawAxiosRequestHeaders = {
      Authorization: `Bearer ${token}`,
    };

    if (Platform.OS === "android") {
      headers = {
        ...headers,
        "Content-Type": "multipart/form-data",
      };
    }

    const response = await axios.post(url, formData, {
      headers: headers,
    });

    return response.data; // Axios automatically parses JSON responses
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error:", error);
      throw new Error("Failed to upload files");
    } else {
      console.error("Unexpected error:", error);
      throw new Error("An unexpected error occurred");
    }
  }
};

export function useSaveToStock() {
  const { trigger, data, isMutating, error } = useSWRMutation(
    `${process.env.EXPO_PUBLIC_API_BASE_URL}/car/save_to_stock`,
    // "http://localhost:9091/car/save_to_stock",

    saveToStock
  );

  return {
    saveCar: trigger,
    savedCar: data?.data ?? null,
    isMutating,
    error,
  };
}

export function useUpdateStock(carId: string) {
  const { trigger, data, isMutating, error } = useSWRMutation(
    `${process.env.EXPO_PUBLIC_API_BASE_URL}/car/update_stock/${carId}`,
    // `http://localhost:9090/car/update_stock/${carId}`,
    updateStock
  );

  return {
    updateCar: trigger,
    savedCar: data?.data ?? null,
    isMutating,
    error,
  };
}

export function useUploadFilesToStock() {
  const { trigger, data, error, isMutating } = useSWRMutation(
    `${process.env.EXPO_PUBLIC_API_BASE_URL}/car/save_files_to_stock`,
    // "http://localhost:9091/car/save_files_to_stock",
    uploadFilesToStock
  );

  return {
    trigger,
    data,
    error,
    isMutating,
  };
}
