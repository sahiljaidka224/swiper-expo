import Colors from "@/constants/Colors";
import { Stack } from "expo-router";
import { View, StyleSheet, Pressable } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import { CarsList } from "@/components/CarsList";
import { useEffect, useState } from "react";
import { useActionSheet } from "@expo/react-native-action-sheet";
import { useSearchCarsCountWithOrg } from "@/api/hooks/car-search";
import { useAuth } from "@/context/AuthContext";

const options = [
  { name: "Active Chats", orderBy: "dateCreate", orderDirection: "desc" },
  { name: "Make A - Z", orderBy: "make", orderDirection: "asc" },
  { name: "Make Z - A", orderBy: "make", orderDirection: "desc" },
  { name: "Newest in Stock", orderBy: "daysInStock", orderDirection: "asc" },
  { name: "Oldest in Stock", orderBy: "daysInStock", orderDirection: "desc" },
  { name: "Newest Year", orderBy: "year", orderDirection: "desc" },
  { name: "Oldest Year", orderBy: "year", orderDirection: "asc" },
  { name: "Lowest Price", orderBy: "price", orderDirection: "asc" },
  { name: "Highest Price", orderBy: "price", orderDirection: "desc" },
  { name: "Lowest Mileage", orderBy: "odometer", orderDirection: "asc" },
  { name: "Highest Mileage", orderBy: "odometer", orderDirection: "desc" },
  { name: "Cancel", orderBy: "", orderDirection: "" },
];

export default function MyStockPage() {
  const { token, user } = useAuth();
  const { showActionSheetWithOptions } = useActionSheet();
  const { cars: carsCount, getCarsCount } = useSearchCarsCountWithOrg();

  const [orderState, setOrderState] = useState<{ orderBy: string; orderDirection: string }>({
    orderBy: "dateCreate",
    orderDirection: "desc",
  });

  const onUpdateCarsCount = () => {
    if (!token || !user?.org?.id) return;
    getCarsCount({ token });
  };

  useEffect(() => {
    onUpdateCarsCount();
  }, []);

  const onShowActionSheet = () => {
    const cancelButtonIndex = options.length - 1;

    showActionSheetWithOptions(
      {
        options: options.map((o) => o.name),
        cancelButtonIndex,
      },
      (buttonIndex: any) => {
        if (buttonIndex !== cancelButtonIndex) {
          setOrderState({
            orderBy: options[buttonIndex].orderBy,
            orderDirection: options[buttonIndex].orderDirection,
          });
        }
      }
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: `My Stock${carsCount && carsCount.length ? `: ${carsCount[0].num}` : ""}`,
          headerRight: () => (
            <Pressable onPress={onShowActionSheet}>
              <MaterialIcons name="sort" size={24} color={Colors.iconGray} />
            </Pressable>
          ),
        }}
      />
      <CarsList
        context="stock"
        orderBy={orderState.orderBy}
        orderDirection={orderState.orderDirection}
        onUpdateCarsCount={onUpdateCarsCount}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
});
