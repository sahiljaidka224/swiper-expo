import Colors from "@/constants/Colors";
import { Stack } from "expo-router";
import { View, StyleSheet, Pressable } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import { CarsList } from "@/components/CarsList";

export default function WatchlistPage() {
  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable onPress={() => {}}>
              <MaterialIcons name="sort" size={24} color={Colors.iconGray} />
            </Pressable>
          ),
        }}
      />
      {/* <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingBottom: 40 }}
      > */}
      <CarsList context="watchlist" />
      {/* </ScrollView> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
});
