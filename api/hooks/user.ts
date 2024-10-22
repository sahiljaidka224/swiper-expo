import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import useSWR from "swr";
import useSWRMutation from "swr/dist/mutation";

const getUserDetails = async (url: string, { arg }: { arg: { token: string } }) => {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-type": "application/json; charset=UTF-8",
      Authorization: `Bearer ${arg.token}`,
    },
  });

  return response.json();
};

const getUserOrgDetails = async (url: string, { arg }: { arg: { token: string } }) => {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-type": "application/json; charset=UTF-8",
      Authorization: `Bearer ${arg.token}`,
    },
  });

  return response.json();
};

const postUserDetails = async (
  url: string,
  {
    arg,
  }: {
    arg: {
      token: string;
      userDetails: {
        firstName: string;
        lastName: string;
        dealershipName?: string;
        displayName?: string;
        profileWizardComplete?: number;
        phoneNumber?: string;
      };
    };
  }
) => {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-type": "application/json; charset=UTF-8",
      Authorization: `Bearer ${arg.token}`,
    },
    body: JSON.stringify(arg.userDetails),
  });

  if (!response.ok) {
    throw new Error("Failed to update user details");
  }

  return response.json();
};

const postUserAvatar = async (
  url: string,
  { arg }: { arg: { token: string; userId: string; avatar: string } }
) => {
  const response = await fetch(`${url}/${arg.userId}/image`, {
    method: "POST",
    headers: {
      "Content-type": "application/json; charset=UTF-8",
      Authorization: `Bearer ${arg.token}`,
    },
    body: JSON.stringify({ avatar: arg.avatar }),
  });

  if (!response.ok) {
    throw new Error("Failed to update user avatar");
  }

  return { data: { success: true } };
};

const loginWithPhone = async (
  url: string,
  { arg }: { arg: { phoneNumber: string; password: string } }
) => {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify({ phoneNumber: arg.phoneNumber, password: arg.password }),
    });

    if (!response.ok) {
      let errorMessage = "Login failed";
      if (response.status === 400) {
        errorMessage = "Bad request. Please check your input.";
      } else if (response.status === 401) {
        errorMessage = "Unauthorized. Incorrect phone number or password.";
      } else if (response.status === 500) {
        errorMessage = "Internal server error. Please try again later.";
      } else if (response.status >= 500 && response.status < 600) {
        errorMessage = "Server error. Please try again later.";
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    throw new Error(error.message || "An unexpected error occurred");
  }
};

export function useGetUserDetails(userId: string) {
  const { token } = useAuth();
  const fetchUrl = `${process.env.EXPO_PUBLIC_API_BASE_URL}/user/${userId}`;
  const { data, error, isLoading } = useSWR(
    token && userId !== "0" ? [fetchUrl, token] : null,
    ([url, token]) => getUserDetails(url, { arg: { token } })
  );

  return {
    user: data?.data ?? null,
    error,
    isLoading,
  };
}

export function useLoginWithPhone() {
  const { trigger, data, isMutating, error } = useSWRMutation(
    `${process.env.EXPO_PUBLIC_API_BASE_URL}/user/phoneLogin/`,
    loginWithPhone
  );

  return {
    loginWithPhone: trigger,
    isMutating,
    error,
    userInfo: data?.data ?? null,
  };
}

export function useGetUserOrgDetails() {
  const { token, user, updateUser } = useAuth();
  const fetchUrl =
    user && user.id
      ? `${process.env.EXPO_PUBLIC_API_BASE_URL}/organisation/userid/${user?.id}`
      : "";

  const {
    data,
    isLoading: isUserOrgDataLoading,
    error: userOrgDataError,
  } = useSWR(token ? [fetchUrl, token] : null, ([url, token]) =>
    getUserOrgDetails(url, { arg: { token } })
  );

  useEffect(() => {
    if (!isUserOrgDataLoading && data && data.data && user) {
      updateUser({
        ...user,
        org: {
          id: data.data.organisationId ?? "",
          name: data.data.name ?? "",
        },
      });
    }
  }, [isUserOrgDataLoading, data]);

  return {
    userOrgData: data?.data,
    isUserOrgDataLoading,
    userOrgDataError,
  };
}

export function useUpdateUserDetails() {
  const { trigger, data, isMutating, error } = useSWRMutation(
    `${process.env.EXPO_PUBLIC_API_BASE_URL}/user`,
    postUserDetails
  );

  return {
    updateUserDetails: trigger,
    updatedUserDetails: data?.data ?? null,
    isMutating,
    error,
  };
}

export function useUpdateUserAvatar() {
  const { trigger, data, isMutating, error } = useSWRMutation(
    `${process.env.EXPO_PUBLIC_API_BASE_URL}/user`,
    postUserAvatar
  );

  return {
    updateUserAvatar: trigger,
    data: data?.data ?? null,
    isUserAvatarMutating: isMutating,
    error,
  };
}

export function useUsersCount() {
  const { token } = useAuth();
  const fetchUrl = `${process.env.EXPO_PUBLIC_API_BASE_URL}/user/totalUsers`;
  const { data, error, isLoading } = useSWR(
    token ? [fetchUrl, token] : null,
    ([url, token]) => getUserDetails(url, { arg: { token } })
  );

  return {
    totalUsers: data?.data ?? null,
    error,
    isLoading,
  };
}