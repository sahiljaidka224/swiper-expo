import { useSaveToStock, useUploadFilesToStock } from "@/api/hooks/add-car";
import AddStock from "@/components/AddStock";
import Button from "@/components/Button";
import CarDetail from "@/components/CarDetail";
import ManualForm from "@/components/ManualModeForm";
import RegoForm from "@/components/RegoForm";
import { SegmentedControl } from "@/components/SegmentedControl";
import Colors from "@/constants/Colors";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { ScrollView, View, StyleSheet, KeyboardAvoidingView, Platform, Alert } from "react-native";

interface SelectedImage {
  name: string | null;
  type: string | undefined;
  uri: string;
  size: number | undefined;
}

const options = ["Rego Lookup", "Manual Mode"];

export default function AddStockPage() {
  const { user, token } = useAuth();
  const { error, isMutating, saveCar, savedCar } = useSaveToStock();
  const { isMutating: isUploadFilesMutating, trigger: uploadFiles } = useUploadFilesToStock();
  const [mode, setMode] = useState<string>("Rego Lookup");
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [carDetails, setCarDetails] = useState<any | null>();

  console.log({ savedCar });

  useEffect(() => {
    if (error && !isMutating) {
      Alert.alert("Error", error);
    }
  }, [isMutating, error]);

  useEffect(() => {
    const convertUriToBlob = async (uri: string): Promise<Blob> => {
      const response = await fetch(uri);
      const blob = await response.blob();
      return blob;
    };

    if (!isMutating && carDetails && savedCar && savedCar.carId && selectedImages.length > 0) {
      const formData = new FormData();
      formData.append("carId", savedCar.carId);

      selectedImages.forEach(async (asset, index) => {
        const blob = await convertUriToBlob(asset.uri);
        formData.append(`file${index}`, {
          uri: asset.uri,
          name: asset.name,
          type: asset.type,
        });
      });

      console.log(formData);

      try {
        if (!token) return;
        uploadFiles({ formData, token });
        console.log("Upload successful!");
      } catch (error) {
        console.log("Upload failed:", error);
        // setUploadError('Upload failed. Retrying...');

        // Retry logic
        try {
          // await trigger(formData);
          console.log("Retry successful!");
        } catch (retryError) {
          console.log("Retry failed:", retryError);
          // setUploadError("Retry failed");
        }
      } finally {
        setCarDetails(null);
        setSelectedImages([]);
      }
    } else {
      // setCarDetails(null);
      // setSelectedImages([]);
    }
  }, [isMutating, savedCar]);

  const onAddCarToStock = () => {
    if (!carDetails || !user || !user.org) return;

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
    };

    if (carModel && token) {
      saveCar({ carModel, token });
    }

    console.log({ carModel });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <AddStock selectedImages={selectedImages} setSelectedImages={setSelectedImages} />

        <View style={{ flex: 1, padding: 12 }}>
          <View
            style={{
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <SegmentedControl options={options} selectedOption={mode} onOptionPress={setMode} />
          </View>

          {carDetails && (
            <>
              <CarDetail
                car={{
                  make: carDetails?.make,
                  model: carDetails?.model,
                  year: carDetails?.year_of_manufacture,
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
                onPress={() => {}}
              />
              <View style={{ marginTop: 10 }}>
                <Button
                  title="Add car to stock"
                  type={carDetails ? "primary" : "disabled"}
                  onPress={onAddCarToStock}
                  isLoading={isMutating}
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
});

// let carModelLocal = {
//   organisationId: orgId,
//   dealerId: dealerId,
//   importSource: this.REGO_PAGE,
//   rego: String(this.carModel.rego ?? this.regoPlate ?? '').toUpperCase(),
//   year: String(this.carModel.YearCreate).toLowerCase(),
//   make: String(this.carModel.ManufacturerName).toLowerCase(),
//   // badge: String(this.carModel?.engine_number ?? '').toLowerCase(),
//   engineNo: String(this.carModel?.engine_number ?? '').toLowerCase(),
//   model: String(this.carModel.model).toLowerCase(),
//   body: String(this.carModel?.body_type ?? '').toLowerCase(),
//   colour: String(this.carModel?.colour ?? '').toLowerCase(),
//   vin: String(this.carModel?.vin ?? '').toLowerCase(),
//   odometer : Number(this.carModel?.odometer) ?? 0,
//   wholesale: '1',
//   status: String(this.carModel?.registration?.status ?? ''),
//   month: String(this.carModel?.MonthCreate ?? ''),
//   regoState: String(this.carModel?.plate?.state ?? '').toLowerCase(),
//   regoExpiry: String(this.carModel?.registration?.expiry_date ?? '').toLowerCase(),
//   transmission: String(this.carModel?.transmission ?? "")
// };