import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { router, Stack, useLocalSearchParams, useSegments } from "expo-router";
import { useGetCarDetails } from "@/api/hooks/car-detail";
import Colors from "@/constants/Colors";
import React from "react";
import CarDetail from "@/components/CarDetail";
import Carousel from "@/components/Carousel";
import { useEffect, useState } from "react";
import { showToast } from "@/components/Toast";
import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import AddStock, { SelectedImage } from "@/components/AddStock";

export default function CarDetailPage() {
  const { user } = useAuth();
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [isEdit, setIsEdit] = useState(false);
  const segments = useSegments();
  const { id } = useLocalSearchParams();
  const { car, isLoading, error, refetch } = useGetCarDetails(id as string);

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

  const canEdit =
    car?.organisationId === user?.org?.id &&
    segments[1] === "(stock)" &&
    car?.importSource === "regopage";
  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerRight: () => {
            if (canEdit) {
              return (
                <View style={{ flexDirection: "row" }}>
                  <TouchableOpacity
                    onPress={() => {
                      setIsEdit(!isEdit);
                    }}
                  >
                    {isEdit ? (
                      <MaterialCommunityIcons name="cancel" size={24} color={Colors.primary} />
                    ) : (
                      <FontAwesome name="edit" size={24} color={Colors.primary} />
                    )}
                  </TouchableOpacity>
                </View>
              );
            }
          },
        }}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {isLoading && <ActivityIndicator color={Colors.primary} size="large" />}
        {car && (
          <>
            {canEdit && isEdit ? (
              <AddStock selectedImages={selectedImages} setSelectedImages={setSelectedImages} />
            ) : (
              <Carousel images={images} price={car?.price} />
            )}
            {/* <Carousel images={images} price={car?.price} /> */}
            <CarDetail
              car={car}
              context={segments[1]}
              isEditing={isEdit}
              setIsEdit={setIsEdit}
              refetchCar={refetch}
              selectedImages={selectedImages}
            />
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
});
