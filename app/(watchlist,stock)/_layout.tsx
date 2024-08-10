import { Stack } from "expo-router";

export default function UserLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="[user]"
        options={{
          headerShown: false,
          title: "",
          headerBackTitle: "",
        }}
      />
    </Stack>
  );
}
