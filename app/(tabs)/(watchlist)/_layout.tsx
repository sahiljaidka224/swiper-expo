import { Stack } from "expo-router";

export default function WatchlistLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Watchlist",
          headerLargeTitle: false,
          headerShadowVisible: false,
          headerBlurEffect: "regular",
          headerTransparent: true,
        }}
      />
      <Stack.Screen
        name="car/[id]"
        options={{
          title: "",
        }}
      />
      <Stack.Screen
        name="user/[user]"
        options={{
          title: "",
        }}
      />
    </Stack>
  );
}
