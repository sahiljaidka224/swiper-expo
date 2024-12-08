import { StyleSheet, View } from "react-native";
import ActionSheet, { SheetProps, useSheetRef } from "react-native-actions-sheet";
import Button from "../Button";
import Colors from "@/constants/Colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function WatchlistActionSheet(props: SheetProps<"watchlist-sheet">) {
  const ref = useSheetRef("watchlist-sheet");
  const insets = useSafeAreaInsets();

  return (
    <ActionSheet
      id={props.sheetId}
      ref={ref}
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
        {props.payload?.testDriveVisible && (
          <View style={{ height: 50 }}>
            <Button
              onPress={() => ref.current.hide("test-drive")}
              title="Add Test Drive Logs"
              type="primary"
            />
          </View>
        )}
        {props.payload?.deleteVisible && (
          <View style={{ height: 50 }}>
            <Button onPress={() => ref.current.hide("delete")} title="Delete Car" type="primary" />
          </View>
        )}

        <View style={{ height: 50 }}>
          <Button onPress={() => ref.current.hide()} title="Cancel" type="border" />
        </View>
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
  },
});
