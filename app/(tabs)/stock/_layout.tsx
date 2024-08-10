import { Stack } from "expo-router";

export default function MyStockLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "My Stock",
          headerLargeTitle: true,
          headerShadowVisible: false,
          headerBlurEffect: "regular",
          headerTransparent: true,
          // headerStyle: { backgroundColor: Colors.background },
          // headerSearchBarOptions: {
          //   placeholder: "Search",
          // },
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: "",
        }}
      />
    </Stack>
  );
}
