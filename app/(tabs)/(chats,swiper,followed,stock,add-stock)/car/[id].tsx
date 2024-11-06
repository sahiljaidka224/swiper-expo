import { ActivityIndicator, Alert, ScrollView, StyleSheet, View } from "react-native";
import { router, useLocalSearchParams, useSegments } from "expo-router";
import { useGetCarDetails } from "@/api/hooks/car-detail";
import Colors from "@/constants/Colors";
import React from "react";
import CarDetail from "@/components/CarDetail";
import Carousel from "@/components/Carousel";
import { useEffect } from "react";
import { showToast } from "@/components/Toast";

export default function CarDetailPage() {
  const segments = useSegments();
  const { id } = useLocalSearchParams();
  const { car, isLoading, error } = useGetCarDetails(id as string);

  useEffect(() => {
    if (error && !isLoading) {
      showToast("Info", "SOLD. Please contact the dealer to know more.", "info");
      router.back();
    }
  }, [error, isLoading]);
  const images =
    car?.images.filter(
      (value: { imageIndex: number }, index: any, self: any[]) =>
        index === self.findIndex((t) => t.imageIndex === value.imageIndex)
    ) ?? [];

  return (
    <View style={styles.container}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {isLoading && <ActivityIndicator color={Colors.primary} size="large" />}
        {car && (
          <>
            <Carousel images={images} price={car?.price} />
            <CarDetail car={car} context={segments[1]} />
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
});
