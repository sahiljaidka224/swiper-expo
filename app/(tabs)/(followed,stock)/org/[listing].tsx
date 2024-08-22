import Colors from "@/constants/Colors";
import { Stack, useLocalSearchParams } from "expo-router";
import { StyleSheet, View } from "react-native";
import { CarsList } from "@/components/CarsList";
import { useState } from "react";

export default function OrgListing() {
  const [orderState, setOrderState] = useState<{ orderBy: string; orderDirection: string }>({
    orderBy: "dateCreate",
    orderDirection: "desc",
  });

  const { orgId } = useLocalSearchParams();

  console.log({ orgId });

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerTitle: "" }} />
      <CarsList
        context="search"
        orderBy={orderState.orderBy}
        orderDirection={orderState.orderDirection}
        orgId={orgId as string}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
