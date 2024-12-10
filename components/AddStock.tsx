import * as ImagePicker from "expo-image-picker";
import { saveToLibraryAsync } from "expo-media-library";

import {
  RenderItemParams,
  NestableDraggableFlatList,
  NestableScrollContainer,
  ScaleDecorator,
} from "react-native-draggable-flatlist";
import Colors from "@/constants/Colors";
import { Image } from "expo-image";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import AntDesign from "@expo/vector-icons/build/AntDesign";
import { showToast } from "./Toast";
import { useState } from "react";
import CameraView from "./CameraView";
import React from "react";
import { Portal } from "@gorhom/portal";

const addCarPlaceholder = require("@/assets/images/add-image.png");
const addCarSmallPlaceholder = require("@/assets/images/add-image-small.png");

export interface SelectedImage {
  name: string | null;
  type: string | undefined;
  uri: string | undefined;
  size: number | undefined;
  index: number | undefined;
  isPlaceholder?: boolean;
  source?: "camera" | "gallery";
}

const NUM_IMAGES = 20;

function updatePlaceholderImages(selectedImagesCount: number): SelectedImage[] {
  return Array.from({ length: NUM_IMAGES - selectedImagesCount }, (_, i) => ({
    index: i + 100,
    isPlaceholder: true,
    uri: undefined,
    name: null,
    size: undefined,
    type: undefined,
    source: undefined,
  }));
}
export default function AddStock({
  selectedImages,
  setSelectedImages,
}: {
  selectedImages: SelectedImage[];
  setSelectedImages: (selImage: SelectedImage[]) => void;
}) {
  const [isCameraVisible, setCameraVisible] = useState(false);
  const [placeholderImages, setPlaceholderImages] = useState<SelectedImage[]>(
    updatePlaceholderImages(selectedImages.length)
  );

  const onOpenCamera = () => {
    setCameraVisible(!isCameraVisible);
  };

  const triggerImageSelection = (
    result: ImagePicker.ImagePickerSuccessResult,
    source: "gallery" | "camera" = "gallery"
  ) => {
    const files = [];
    let index = selectedImages.length;
    for (let [, file] of result.assets.entries()) {
      const uri = file.uri;
      let name: string | null = "";
      let type: string | undefined = "";

      if (Platform.OS === "ios" && file.fileName) {
        name = file.fileName;
        type = file.type;
      } else {
        type = file.type;
        name = `Camera_0${index}.jpeg`;
      }

      if (source === "camera") {
        saveToLibraryAsync(uri)
          .then()
          .catch(() => showToast("Error", "Please allow Swiper to save images.", "error"));
      }

      let tempFile = {
        name: name,
        type: Platform.OS === "android" && type !== "video" ? `image/${file.type}` : type,
        uri: Platform.OS === "android" ? uri : uri.replace("file://", ""),
        size: file.fileSize,
        index,
        isPlaceholder: false,
        source,
      };
      files.push(tempFile);
      index++;
    }

    setPlaceholderImages(updatePlaceholderImages(selectedImages.length + files.length));

    setSelectedImages([...selectedImages, ...files]);
  };

  const onPickImageFromGallery = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        aspect: [4, 3],
        quality: 0.5,
        allowsMultipleSelection: true,
        selectionLimit: NUM_IMAGES - selectedImages.length,
        orderedSelection: true,
      });

      if (!result.canceled) {
        if (result.assets.length > 0) {
          triggerImageSelection(result);
        }
      }
    } catch (error) {
      showToast("Error", "Failed to load image from Gallery", "error");
    }
  };

  const onRemove = (index: number) => {
    const newSelection = selectedImages.filter((_, i) => i !== index);
    setSelectedImages(newSelection);

    setPlaceholderImages(updatePlaceholderImages(newSelection.length));
  };

  const renderItem = ({ item, drag, isActive, getIndex }: RenderItemParams<SelectedImage>) => {
    const index = getIndex();
    if (index === undefined) return;

    if (!item.isPlaceholder && !item.uri) return null;

    return (
      <ScaleDecorator>
        <Pressable
          key={index}
          onLongPress={item.isPlaceholder ? null : drag}
          disabled={isActive}
          style={{
            width: 76,
            height: 76,
            marginRight: 15,
          }}
          onPress={onOpenCamera}
        >
          {item.isPlaceholder ? (
            <Image
              style={styles.smallImage}
              placeholder={addCarSmallPlaceholder}
              contentFit="cover"
              recyclingKey={`${index}-${selectedImages[index]?.name}`}
            />
          ) : (
            <Image
              style={styles.smallImage}
              placeholder={addCarSmallPlaceholder}
              contentFit="cover"
              source={{
                uri: selectedImages.length >= index ? selectedImages[index]?.uri : undefined,
              }}
              recyclingKey={`${index}-${selectedImages[index]?.name}`}
            />
          )}

          {selectedImages[index] && !item.isPlaceholder && (
            <Pressable
              style={{ position: "absolute", right: 10, top: 5 }}
              onPress={() => onRemove(index)}
            >
              <AntDesign name="closecircle" size={24} color={Colors.background} />
            </Pressable>
          )}
        </Pressable>
      </ScaleDecorator>
    );
  };

  return (
    <View style={styles.container}>
      {isCameraVisible && (
        <Portal>
          <CameraView
            isCameraVisible={isCameraVisible}
            closeCamera={() => setCameraVisible(false)}
            selectedImages={selectedImages}
            setSelectedImages={(images) => setSelectedImages(images)}
            onOpenGallery={onPickImageFromGallery}
          />
        </Portal>
      )}
      <Pressable style={styles.bannerImageContainer} onPress={onOpenCamera}>
        <Image
          style={styles.bannerImageSelected}
          placeholder={addCarPlaceholder}
          source={{ uri: selectedImages.length > 0 ? selectedImages[0].uri : undefined }}
          contentFit={selectedImages.length > 0 ? "cover" : "contain"}
          recyclingKey={selectedImages.length > 0 ? selectedImages[0].name : undefined}
          placeholderContentFit="cover"
        />
        {selectedImages.length > 0 && (
          <Pressable
            style={{ position: "absolute", right: 10, top: 5 }}
            onPress={() => onRemove(0)}
          >
            <AntDesign name="closecircle" size={24} color={Colors.background} />
          </Pressable>
        )}
      </Pressable>
      <NestableScrollContainer>
        <View style={styles.smallImagesContainer}>
          <NestableDraggableFlatList
            data={[...selectedImages, ...placeholderImages]}
            onDragEnd={({ data }) => setSelectedImages(data.filter((d) => !d.isPlaceholder))}
            keyExtractor={(item) => item.index?.toString() || ""}
            renderItem={renderItem}
            horizontal
            scrollEnabled
            showsHorizontalScrollIndicator={false}
          />
        </View>
      </NestableScrollContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bannerImageContainer: {
    width: "100%",
    height: 225,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primaryLight,
  },
  bannerImageSelected: {
    width: "100%",
    height: "100%",
    borderRadius: 0,
  },
  bannerImagePlaceholder: {
    width: 190,
    height: 190,
    borderRadius: 20,
  },
  smallImagesContainer: {
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  smallImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    borderRadius: 10,
  },
});
