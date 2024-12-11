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
import {
  Feather,
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import AddStock, { SelectedImage } from "@/components/AddStock";

export default function CarDetailPage() {
  const { user } = useAuth();
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [isEdit, setIsEdit] = useState(false);
  const segments = useSegments();
  const { id, showMessage } = useLocalSearchParams();
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
        <TouchableOpacity
          onPress={() => {
            if (router.canGoBack()) router.back();
          }}
          style={{
            margin: 10,
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: Colors.primary,
            justifyContent: "center",
            alignItems: "center",
            position: "absolute",
            zIndex: 10,
          }}
        >
          <Ionicons name="chevron-back" size={28} color={Colors.background} />
        </TouchableOpacity>
        {canEdit && (
          <TouchableOpacity
            onPress={() => setIsEdit(!isEdit)}
            style={{
              margin: 10,
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: Colors.primary,
              justifyContent: "center",
              alignItems: "center",
              position: "absolute",
              zIndex: 10,
              right: 5,
              paddingLeft: 2,
            }}
          >
            {isEdit ? (
              <MaterialIcons name="done" size={24} color={Colors.background} />
            ) : (
              <Feather name="edit" size={24} color={Colors.background} />
            )}
          </TouchableOpacity>
        )}
        {car && (
          <>
            {canEdit && isEdit ? (
              <AddStock selectedImages={selectedImages} setSelectedImages={setSelectedImages} />
            ) : (
              <Carousel images={images} price={car?.price} carId={car?.carId} />
            )}
            {/* <Carousel images={images} price={car?.price} /> */}
            <CarDetail
              car={car}
              context={segments[1]}
              isEditing={isEdit}
              setIsEdit={setIsEdit}
              refetchCar={refetch}
              selectedImages={selectedImages}
              showMessageBox={showMessage ? showMessage === "true" : true}
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
