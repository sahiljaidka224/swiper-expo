import Colors from "@/constants/Colors";
import { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, View, TouchableOpacity, SafeAreaView, StatusBar } from "react-native";
import { Image } from "expo-image";
import Text from "./Text";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Modal from "./Modal";
import AwesomeGallery, { GalleryRef } from "react-native-awesome-gallery";
import Animated, { FadeInDown, FadeInUp, FadeOutDown, FadeOutUp } from "react-native-reanimated";
import { useIsFocused } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/build/Ionicons";

export default function Gallery({
  isVisible,
  onClose,
  images,
  setSelectedIndex,
  selectedIndex,
}: {
  selectedIndex: number;
  isVisible: boolean;
  onClose: () => void;
  images: Array<{ url: string; imageIndex: number }>;
  setSelectedIndex: (index: number) => void;
}) {
  const { bottom, top } = useSafeAreaInsets();
  const [infoVisible, setInfoVisible] = useState(true);
  const [mounted, setMounted] = useState(false);
  const isFocused = useIsFocused();
  const gallery = useRef<GalleryRef>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const onIndexChange = useCallback(
    (index: number) => {
      isFocused && setSelectedIndex(index);
    },
    [isFocused]
  );
  const onTap = () => {
    StatusBar.setHidden(infoVisible, "slide");
    setInfoVisible(!infoVisible);
  };

  return (
    <Modal isVisible={isVisible} onClose={onClose} hideHeader>
      {infoVisible && (
        <Animated.View
          entering={mounted ? FadeInUp.duration(250) : undefined}
          exiting={FadeOutUp.duration(250)}
          style={[
            styles.toolbar,
            {
              height: top + 60,
              paddingTop: top,
            },
          ]}
        >
          {images && images.length > 1 && (
            <View style={styles.textContainer}>
              <Text style={styles.headerText}>
                {selectedIndex + 1} of {images.length}
              </Text>
            </View>
          )}
          <Animated.View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              backgroundColor: "transparent",
            }}
          >
            <SafeAreaView>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="chevron-back" size={30} color={Colors.primary} />
              </TouchableOpacity>
            </SafeAreaView>
          </Animated.View>
        </Animated.View>
      )}
      <AwesomeGallery
        ref={gallery}
        data={images}
        keyExtractor={(item) => item.url}
        onIndexChange={onIndexChange}
        initialIndex={selectedIndex}
        numToRender={3}
        onTap={onTap}
        doubleTapInterval={150}
        loop
        renderItem={({ item }) => {
          return (
            <Image
              source={{ uri: item.url }}
              style={StyleSheet.absoluteFillObject}
              contentFit="contain"
            />
          );
        }}
        onSwipeToClose={onClose}
      />
      {infoVisible && images && images.length > 1 && (
        <Animated.View
          entering={mounted ? FadeInDown.duration(250) : undefined}
          exiting={FadeOutDown.duration(250)}
          style={[
            styles.toolbar,
            styles.bottomToolBar,
            {
              height: bottom + 100,
              paddingBottom: bottom,
            },
          ]}
        >
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={styles.textContainer}
              onPress={() =>
                gallery.current?.setIndex(
                  selectedIndex === 0 ? images.length - 1 : selectedIndex - 1
                )
              }
            >
              <Text style={styles.buttonText}>Previous</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.textContainer}
              onPress={() =>
                gallery.current?.setIndex(
                  selectedIndex === images.length - 1 ? 0 : selectedIndex + 1,
                  true
                )
              }
            >
              <Text style={styles.buttonText}>Next</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  textContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  buttonsContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  toolbar: {
    position: "absolute",
    width: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 1,
  },
  bottomToolBar: {
    bottom: 0,
  },
  headerText: {
    fontSize: 16,
    color: "white",
    fontWeight: "600",
  },
});
