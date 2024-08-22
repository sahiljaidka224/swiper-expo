import axios from "axios";
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

const uploadFilesToStock = async (
  url: string,
  { arg: { formData, token } }: { arg: { formData: FormData; token: string } }
) => {
  try {
    const response = await axios.post(url, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data", // Automatically set by axios when FormData is used
      },
    });

    return response.data; // Axios automatically parses JSON responses
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error:", error.response?.data);
      throw new Error("Failed to upload files");
    } else {
      console.error("Unexpected error:", error);
      throw new Error("An unexpected error occurred");
    }
  }
};

export function useSaveToStock() {
  const { trigger, data, isMutating, error } = useSWRMutation(
    "https://backend-swiper.datalinks.nl/car/save_to_stock",
    saveToStock
  );

  return {
    saveCar: trigger,
    savedCar: data?.data ?? null,
    isMutating,
    error,
  };
}

export function useUploadFilesToStock() {
  const { trigger, data, error, isMutating } = useSWRMutation(
    "https://backend-swiper.datalinks.nl/car/save_files_to_stock",
    uploadFilesToStock
  );

  return {
    trigger,
    data,
    error,
    isMutating,
  };
}
