import Colors from "@/constants/Colors";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { CameraView as ExpoCameraView, useCameraPermissions } from "expo-camera";
import { useEffect, useRef, useState } from "react";
import * as Linking from "expo-linking";

import {
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Image } from "expo-image";
import React from "react";
import { showToast } from "./Toast";
import { saveToLibraryAsync } from "expo-media-library";

interface Props {
  isCameraVisible: boolean;
  closeCamera: () => void;
  selectedImages: SelectedImage[];
  setSelectedImages: (images: SelectedImage[]) => void;
  onOpenGallery: () => void;
}

export default function CameraView({
  isCameraVisible,
  closeCamera,
  selectedImages,
  setSelectedImages,
  onOpenGallery,
}: Props) {
  const [isTakingPicture, setIsTakingPicture] = useState(true);
  const cameraRef = useRef<ExpoCameraView | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const animationProgress = useSharedValue(0);
  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

  useEffect(() => {
    if (permission && !permission.granted) {
      requestPermission();
    }
  }, []);

  useEffect(() => {
    if (isCameraVisible) {
      animationProgress.value = withTiming(1, { duration: 400 });
    } else {
      animationProgress.value = withTiming(0, { duration: 400 });
    }
  }, [isCameraVisible]);

  const animatedStyle = useAnimatedStyle(() => ({
    flex: 1,
    ...StyleSheet.absoluteFillObject,
    bottom: interpolate(animationProgress.value, [0, 1], [20, 0]),
    right: interpolate(animationProgress.value, [0, 1], [20, 0]),
    width: interpolate(animationProgress.value, [0, 1], [80, screenWidth]),
    height: interpolate(animationProgress.value, [0, 1], [80, screenHeight]),
    borderRadius: interpolate(animationProgress.value, [0, 1], [40, 0]),
    backgroundColor: "#000",
    overflow: "hidden",
    zIndex: 100,
  }));

  if (!permission) {
    return null;
  }

  if (permission && !permission.granted) {
    if (permission.canAskAgain) {
      requestPermission();
      return;
    }
    showToast("Error", "Camera permission not granted.", "error");
    Linking.openSettings();
    closeCamera();
    return;
  }

  const onCapture = () => {
    if (cameraRef.current) {
      setIsTakingPicture(true);
      cameraRef.current
        .takePictureAsync()
        .then((photo) => {
          if (!photo) return;
          saveToLibraryAsync(photo.uri);
          setSelectedImages([
            ...selectedImages,
            {
              uri: photo.uri,
              name: Math.random().toString(36).substring(7),
              type: "image/jpeg",
              size: undefined,
              index: selectedImages.length,
              source: "camera",
              isPlaceholder: false,
            },
          ]);
        })
        .finally(() => {
          setIsTakingPicture(false);
        });
    }
  };

  const deletePhoto = (index: number) => {
    console.log("delete photo", index);
    setSelectedImages(selectedImages.filter((img) => img.index !== index));
  };

  const onDone = () => {
    closeCamera();
  };

  return (
    <Animated.View style={animatedStyle}>
      <SafeAreaView style={styles.container}>
        <ExpoCameraView
          ref={cameraRef}
          style={styles.camera}
          facing="back"
          active={isCameraVisible}
          onCameraReady={() => {
            setIsTakingPicture(false);
          }}
          mode="picture"
        >
          <View
            style={{
              justifyContent: "space-between",
              display: "flex",
              flexDirection: "row",
              backgroundColor: "transparent",
            }}
          >
            <TouchableOpacity style={styles.backButton} onPress={closeCamera}>
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>

          <View style={styles.bottomContainer}>
            <ScrollView horizontal style={styles.photoPreview}>
              {selectedImages.map((photo, index) => (
                <View key={index} style={styles.photoContainer}>
                  <Image source={{ uri: photo.uri }} style={styles.photo} />
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() =>
                      typeof photo.index === "number" ? deletePhoto(photo.index) : null
                    }
                  >
                    <Text style={styles.deleteText}>X</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: "transparent",
                paddingHorizontal: 10,
                width: "100%",
              }}
            >
              <TouchableOpacity onPress={onOpenGallery} style={{ padding: 5 }}>
                <FontAwesome5 name="images" size={24} color="white" />
              </TouchableOpacity>
              <View style={styles.captureButtonContainer}>
                <TouchableOpacity
                  style={styles.captureButton}
                  onPress={onCapture}
                  disabled={isTakingPicture}
                />
              </View>
              <TouchableOpacity onPress={onDone} style={{ padding: 10, zIndex: 10 }}>
                <Text style={styles.doneText}>DONE</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ExpoCameraView>
      </SafeAreaView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  message: {
    textAlign: "center",
  },
  camera: {
    flex: 1,
    zIndex: 50,
    width: "100%",
  },
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    width: "100%",
  },
  backButton: {
    height: 40,
    width: 40,
    borderRadius: 20,
    backgroundColor: Colors.textDark,
    margin: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  captureButtonContainer: {
    height: 80,
    width: 80,
    borderRadius: 40,
    borderColor: Colors.primary,
    borderWidth: 3,
    padding: 2,
    margin: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  captureButton: {
    backgroundColor: Colors.primary,
    width: "100%",
    height: "100%",
    borderRadius: 999999,
  },
  text: {
    fontSize: 18,
    fontFamily: "SF_Pro_Display_Medium",
    color: Colors.primary,
    textAlign: "center",
  },
  photoPreview: {
    flexDirection: "row",
    marginTop: 20,
    padding: 10,
  },
  photoContainer: {
    position: "relative",
    marginRight: 10,
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  doneText: { color: "white", fontFamily: "SF_Pro_Display_Medium" },
  deleteButton: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "red",
    borderRadius: 15,
    padding: 5,
  },
  deleteText: {
    color: "#fff",
    fontSize: 12,
  },
});
