import { StyleSheet, View } from "react-native";
import ActionSheet, { useSheetRef } from "react-native-actions-sheet";
import Button from "../Button";
import Colors from "@/constants/Colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function CameraActionSheet() {
  const ref = useSheetRef("camera-sheet");
  const insets = useSafeAreaInsets();

  return (
    <ActionSheet
      safeAreaInsets={insets}
      drawUnderStatusBar
      gestureEnabled
      containerStyle={{ backgroundColor: Colors.background }}
      indicatorStyle={{
        marginTop: 10,
        width: 150,
      }}
    >
      <View style={styles.itemButtonsContainer}>
        <Button onPress={() => ref.current.hide("camera")} title="Camera" type="primary" />
        <Button onPress={() => ref.current.hide("gallery")} title="Gallery" />
        <Button onPress={() => ref.current.hide()} title="Cancel" type="border" />
      </View>
    </ActionSheet>
  );
}

const styles = StyleSheet.create({
  itemButtonsContainer: {
    flexDirection: "column",
    paddingVertical: 15,
    width: "80%",
    gap: 25,
    alignSelf: "center",
    minHeight: 220,
  },
});
