import * as ImagePicker from "expo-image-picker";

import Colors from "@/constants/Colors";
import { Image } from "expo-image";
import { Alert, Platform, Pressable, ScrollView, StyleSheet, View } from "react-native";
import AntDesign from "@expo/vector-icons/build/AntDesign";
import { useActionSheet } from "@expo/react-native-action-sheet";

const addCarPlaceholder = require("@/assets/images/no-image-new.png");
const addCarSmallPlaceholder = require("@/assets/images/no-image-new-small.png");
const options = ["Gallery", "Camera", "Cancel"];

interface SelectedImage {
  name: string | null;
  type: string | undefined;
  uri: string;
  size: number | undefined;
}

export default function AddStock({
  selectedImages,
  setSelectedImages,
}: {
  selectedImages: SelectedImage[];
  setSelectedImages: (selImage: SelectedImage[]) => void;
}) {
  const { showActionSheetWithOptions } = useActionSheet();

  const onShowActionSheet = () => {
    const cancelButtonIndex = 2;

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
      },
      (buttonIndex) => {
        if (buttonIndex !== cancelButtonIndex) {
          if (buttonIndex === 0) {
            onAddImagePress();
            return;
          }

          if (buttonIndex === 1) {
            Alert.alert("Coming soon..", "This feature will be available soon!");
            return;
          }
        }
      }
    );
  };

  const onAddImagePress = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      aspect: [4, 3],
      quality: 1,
      allowsMultipleSelection: true,
      selectionLimit: 10 - selectedImages.length,
    });

    if (!result.canceled) {
      const files = [];
      for (let file of result.assets) {
        const uri = file.uri;
        let name: string | null = "";
        let type: string | undefined = "";

        if (Platform.OS === "ios" && file.fileName !== undefined) {
          name = file.fileName;
          type = file.type;
        } else {
          type = file.type;
          name = "Camera_001.jpeg";
        }

        let tempFile = {
          name: name,
          type: Platform.OS === "android" ? file.type : type,
          uri: Platform.OS === "android" ? uri : uri.replace("file://", ""),
          size: file.fileSize,
        };
        files.push(tempFile);
      }
      setSelectedImages([...selectedImages, ...files]);
    }
  };

  const onRemove = (index: number) => {
    const newSelection = selectedImages.filter((_, i) => i !== index);
    setSelectedImages(newSelection);
  };

  return (
    <View style={styles.container}>
      <Pressable style={styles.bannerImageContainer} onPress={onShowActionSheet}>
        <Image
          style={
            selectedImages.length > 0 ? styles.bannerImageSelected : styles.bannerImagePlaceholder
          }
          placeholder={addCarPlaceholder}
          source={{ uri: selectedImages.length > 0 ? selectedImages[0].uri : undefined }}
          contentFit={selectedImages.length > 0 ? "cover" : "contain"}
          recyclingKey={selectedImages.length > 0 ? selectedImages[0].name : undefined}
        />
      </Pressable>
      <View style={styles.smallImagesContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {Array(10)
            .fill(1)
            .map((_, index) => {
              return (
                <Pressable
                  key={index}
                  style={{
                    width: 95,
                    height: 95,
                    marginRight: 10,
                  }}
                  onPress={onShowActionSheet}
                >
                  <Image
                    style={styles.smallImage}
                    placeholder={addCarSmallPlaceholder}
                    contentFit="cover"
                    source={{
                      uri: selectedImages.length >= index ? selectedImages[index]?.uri : undefined,
                    }}
                    recyclingKey={`${index}-${selectedImages[index]?.name}`}
                  />
                  {selectedImages[index] && (
                    <Pressable
                      style={{ position: "absolute", right: 10, top: 5 }}
                      onPress={() => onRemove(index)}
                    >
                      <AntDesign name="closecircle" size={24} color={Colors.background} />
                    </Pressable>
                  )}
                </Pressable>
              );
            })}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bannerImageContainer: {
    padding: 5,
    width: "100%",
    height: 200,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.lightGray,
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
    resizeMode: "contain",
    borderRadius: 10,
  },
});