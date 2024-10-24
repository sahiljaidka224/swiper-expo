import * as SecureStore from "expo-secure-store";

export const setSwiperSound = async (enabled: boolean) => {
  await SecureStore.setItemAsync("swipeSound", enabled.toString());
};

export const getCanPlaySwiperSound = async () => {
  const sound = await SecureStore.getItemAsync("swipeSound");
  return sound === "true";
};
