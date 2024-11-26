import { saveToStock, uploadFilesToStock } from "@/api/hooks/add-car";
import AddStockImages, { SelectedImage } from "@/components/AddStock";
import Button from "@/components/Button";
import CarDetail from "@/components/CarDetail";
import ManualForm from "@/components/ManualModeForm";
import RegoForm from "@/components/RegoForm";
import { SegmentedControl } from "@/components/SegmentedControl";
import { showToast } from "@/components/Toast";
import Colors from "@/constants/Colors";
import { useAuth } from "@/context/AuthContext";
import { router } from "expo-router";
import React from "react";
import { useState } from "react";
import { View, StyleSheet, Platform, SafeAreaView } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

const options = ["Rego Lookup", "Manual Mode"];

export default function AddStockPage() {
  const [isLoading, setLoading] = useState<boolean>(false);
  const { user, token } = useAuth();

  const [mode, setMode] = useState<string>("Rego Lookup");
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [carDetails, setCarDetails] = useState<any | null>();

  const onAddCarToStock = async (pushToContacts: boolean) => {
    setLoading(true);
    if (!carDetails || !user || !user.org) {
      showToast("Error", "Failed to add car to stock!", "error");
      return;
    }

    const price = carDetails?.price ? Number(carDetails?.price) : 0;
    const carModel = {
      organisationId: user.org.id,
      dealerId: user.org.id,
      importSource: "regopage",
      rego: carDetails?.plate?.number?.toUpperCase(),
      year: carDetails?.year_of_manufacture,
      make: carDetails?.make,
      model: carDetails?.model,
      regoState: carDetails?.regoState,
      regoExpiry: carDetails?.registration?.expiry_date,
      compliance: carDetails?.compliance_plate,
      colour: carDetails?.colour,
      body: carDetails?.body_type,
      vin: carDetails?.vin,
      engineNo: carDetails?.engineNo,
      odometer: carDetails?.odometer,
      transmission: carDetails?.transmission,
      wholesale: 1,
      price: typeof price === "number" ? price : undefined,
    };

    if (carModel && token) {
      try {
        const carData = await saveToStock(carModel, token);
        if (carData && carData.data && carData.data.carId) {
          const { carId } = carData.data;
          if (selectedImages.length > 0) {
            showToast("In Progress", "Car uploaded, Image upload in progress!", "info");
            const formData = new FormData();
            formData.append("carId", carId);

            for (let index = 0; index < selectedImages.length; index++) {
              const file = selectedImages[index];

              if (!file.uri) {
                continue;
              }

              formData.append(`file${index}`, {
                name: `image${index}.jpg`,
                fileName: Platform.OS === "ios" ? `image` : `image${index}.jpg`,
                type: "image/jpg",
                uri: Platform.OS === "ios" ? file.uri.replace("file://", "") : file.uri,
              } as any);
            }
            showToast("Success", "Car added to stock successfully!", "success");
            try {
              await uploadFilesToStock(formData, token);
            } catch (error) {
              showToast("Error", "Failed to upload images! Please edit stock", "error");
            }

            if (pushToContacts) {
              router.push({
                pathname: `/(tabs)/(add-stock)/users-list?carId=${carId}`,
              });
            }
            setCarDetails(null);
            setSelectedImages([]);
          } else {
            showToast("Success", "Car added to stock successfully!", "success");

            if (pushToContacts) {
              router.push({
                pathname: `/(tabs)/(add-stock)/users-list?carId=${carId}`,
              });
            }
            setCarDetails(null);
            setSelectedImages([]);
          }
        }
      } catch (error) {
        showToast("Error", "Failed to add car to stock!", "error");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAwareScrollView style={[styles.container, { marginTop: 0 }]} bottomOffset={50}>
        <AddStockImages selectedImages={selectedImages} setSelectedImages={setSelectedImages} />

        <View style={{ flex: 1, padding: 12 }}>
          {!carDetails && (
            <View
              style={{
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <SegmentedControl
                options={options}
                selectedOption={mode}
                onOptionPress={setMode}
                width={300}
              />
            </View>
          )}
          {carDetails && (
            <>
              <CarDetail
                car={{
                  make: carDetails?.make ?? "",
                  model: carDetails?.model ?? "",
                  year: carDetails?.year_of_manufacture ?? "",
                  rego: carDetails?.plate?.number,
                  regoExpiry: carDetails?.registration?.expiry_date,
                  compliance: carDetails?.compliance_plate,
                  colour: carDetails?.colour,
                  body: carDetails?.body_type,
                  vin: carDetails?.vin,
                  engineNo: carDetails?.engineNo,
                  odometer: Number(carDetails?.odometer),
                  transmission: carDetails?.transmission,
                }}
                context={null}
              />
              <Button
                type={carDetails ? "primary" : "disabled"}
                title="Push to Swiper Users"
                onPress={() => onAddCarToStock(true)}
                isLoading={isLoading}
                disabled={!carDetails || isLoading}
              />
              <View style={{ marginTop: 10 }}>
                <Button
                  title="Add car to stock"
                  type={carDetails ? "primary" : "disabled"}
                  onPress={() => onAddCarToStock(false)}
                  isLoading={isLoading}
                  disabled={!carDetails || isLoading}
                />
              </View>
              <View style={{ marginTop: 20 }}>
                <Button title="Back" onPress={() => setCarDetails(null)} type="secondary" />
              </View>
            </>
          )}

          {mode === "Rego Lookup" && !carDetails ? (
            <RegoForm setCarDetails={setCarDetails} />
          ) : null}
          {mode === "Manual Mode" && !carDetails ? (
            <ManualForm setCarDetails={setCarDetails} />
          ) : null}
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: Colors.background, flex: 1 },
});
