import * as ImagePicker from "expo-image-picker";
import * as Linking from "expo-linking";
import * as MediaLibrary from "expo-media-library";

import Button from "@/components/Button";
import Colors from "@/constants/Colors";
import React, { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { TextInput } from "react-native-gesture-handler";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { Image } from "expo-image";
import { SheetManager } from "react-native-actions-sheet";
import { showToast } from "@/components/Toast";
import Text from "@/components/Text";
import { router } from "expo-router";

const addCarSmallPlaceholder = require("@/assets/images/no-image-new-small.png");

type FormData = {
  name: string;
  phone: string;
  source: string;
};

const NUM_IMAGES = 2;

function updatePlaceholderImages(selectedImagesCount: number): SelectedImage[] {
  return Array.from({ length: NUM_IMAGES - selectedImagesCount }, (_, i) => ({
    index: i + 100,
    isPlaceholder: true,
    uri: undefined,
    name: null,
    size: undefined,
    type: undefined,
  }));
}

export default function TestDrivePage() {
  const [licenseFront, setLicenseFront] = useState<SelectedImage | null>(null);
  const [licenseBack, setLicenseBack] = useState<SelectedImage | null>(null);

  const [cameraStatus, requestCameraPermission] = ImagePicker.useCameraPermissions();

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    getValues,
  } = useForm<FormData>({
    defaultValues: {
      name: "",
      phone: "",
      source: "",
    },
  });

  const phoneRef = useRef<TextInput | null>(null);

  const onAddLicensePhotos = (type: "front" | "back") => {
    SheetManager.show("camera-sheet").then((result) => {
      setTimeout(() => {
        if (!result) return;
        if (result === "camera") {
          onPickImageFromCamera(type);
          return;
        }

        onPickImageFromGallery(type);
      }, 100);
    });
  };

  const onPickImageFromCamera = async (type: "front" | "back") => {
    if (cameraStatus) {
      if (
        cameraStatus.status === ImagePicker.PermissionStatus.UNDETERMINED ||
        (cameraStatus.status === ImagePicker.PermissionStatus.DENIED && cameraStatus.canAskAgain)
      ) {
        const permission = await requestCameraPermission();
        if (permission.granted) {
          await handleLaunchCamera(type);
        }
      } else if (cameraStatus.status === ImagePicker.PermissionStatus.DENIED) {
        await Linking.openSettings();
      } else {
        await handleLaunchCamera(type);
      }
    }
  };

  const handleLaunchCamera = async (type: "front" | "back") => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.5,
        aspect: [4, 3],
        allowsMultipleSelection: true,
        selectionLimit: 1,
        orderedSelection: true,
      });
      if (!result.canceled) {
        if (result.assets.length > 0) {
          triggerImageSelection(result, "camera", type);
        }
      }
    } catch (error) {
      showToast("Error", "Failed to load image from camera", "error");
    }
  };

  const onPickImageFromGallery = async (type: "front" | "back") => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        aspect: [4, 3],
        quality: 0.5,
        allowsMultipleSelection: true,
        selectionLimit: 1,
        orderedSelection: true,
      });

      if (!result.canceled) {
        if (result.assets.length > 0) {
          triggerImageSelection(result, "gallery", type);
        }
      }
    } catch (error) {
      showToast("Error", "Failed to load image from Gallery", "error");
    }
  };

  const triggerImageSelection = (
    result: ImagePicker.ImagePickerSuccessResult,
    source: "gallery" | "camera" = "gallery",
    type: "front" | "back"
  ) => {
    const files = [];

    for (let [, file] of result.assets.entries()) {
      const uri = file.uri;
      let name: string | null = "";
      let type: string | undefined = "";

      if (Platform.OS === "ios" && file.fileName) {
        name = file.fileName;
        type = file.type;
      } else {
        type = file.type;
        name = `Camera_0.jpeg`;
      }

      if (source === "camera") {
        MediaLibrary.saveToLibraryAsync(uri)
          .then()
          .catch(() => showToast("Error", "Please allow Swiper to save images.", "error"));
      }

      let tempFile = {
        name: name,
        type: Platform.OS === "android" && type !== "video" ? `image/${file.type}` : type,
        uri: Platform.OS === "android" ? uri : uri.replace("file://", ""),
        size: file.fileSize,
        index: 0,
        isPlaceholder: false,
      };
      files.push(tempFile);
    }

    if (type === "front") {
      setLicenseFront(files[0]);
    }
    if (type === "back") {
      setLicenseBack(files[0]);
    }
  };

  return (
    <KeyboardAwareScrollView keyboardDismissMode="interactive">
      <View style={styles.wrapper}>
        <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              placeholder="Customer Name*"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value ? value : ""}
              style={styles.textInput}
              maxFontSizeMultiplier={1.3}
              returnKeyType="next"
              returnKeyLabel="next"
              onSubmitEditing={() => phoneRef.current?.focus()}
            />
          )}
          name="name"
        />
        <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              ref={phoneRef}
              placeholder="Customer Phone*"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value ? value : ""}
              style={styles.textInput}
              maxFontSizeMultiplier={1.3}
              keyboardType="number-pad"
            />
          )}
          name="phone"
        />
        <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              placeholder="Lead Source"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value ? value : ""}
              style={styles.textInput}
              maxFontSizeMultiplier={1.3}
            />
          )}
          name="source"
        />

        <View style={styles.buttonContainer}>
          <Pressable onPress={() => onAddLicensePhotos("front")} style={{ alignItems: "center" }}>
            <Image
              style={styles.smallImage}
              placeholder={addCarSmallPlaceholder}
              contentFit="cover"
              source={{
                uri: licenseFront?.uri,
              }}
            />
            <Text style={styles.licenseTitle}>License Front Image</Text>
          </Pressable>
          <Pressable onPress={() => onAddLicensePhotos("back")} style={{ alignItems: "center" }}>
            <Image
              style={styles.smallImage}
              placeholder={addCarSmallPlaceholder}
              contentFit="cover"
              source={{
                uri: licenseBack?.uri,
              }}
            />
            <Text style={styles.licenseTitle}>License Back Image</Text>
          </Pressable>
        </View>
        <Button
          title="Save"
          onPress={() => {
            router.back();
            showToast("Success", "Test Drive details saved successfully", "success");
          }}
        />
      </View>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  wrapper: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    gap: 20,
  },
  textInput: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 15,
    backgroundColor: Colors.lightGrayBackground,
    borderColor: Colors.borderGray,
    fontFamily: "SF_Pro_Display_Regular",
    fontSize: 20,
    color: Colors.textDark,
    textTransform: "capitalize",
  },
  buttonContainer: {
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
  },
  smallImage: {
    width: 150,
    height: 100,
    resizeMode: "contain",
    borderRadius: 10,
  },
  licenseTitle: {
    fontSize: 16,
    color: Colors.textDark,
    fontFamily: "SF_Pro_Display_Medium",
  },
});
