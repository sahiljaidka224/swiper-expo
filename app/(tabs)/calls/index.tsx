import Colors from "@/constants/Colors";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { View, TouchableOpacity, ScrollView, StyleSheet, Image } from "react-native";
import calls from "@/assets/data/calls.json";
import { defaultStyles } from "@/constants/Styles";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { SegmentedControl } from "@/components/SegmentedControl";
import Animated, {
  CurvedTransition,
  FadeInUp,
  FadeOutUp,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import SwipeableRow from "@/components/SwipeableRow";
import * as Haptics from "expo-haptics";
import Text from "@/components/Text";

const transition = CurvedTransition.delay(100);
const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export default function CallsPage() {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [items, setItems] = useState(calls);
  const [selectedOption, setSelectedOption] = useState("All");
  const editing = useSharedValue(-30);

  useEffect(() => {
    if (selectedOption === "All") {
      setItems(calls);
      return;
    }

    setItems(calls.filter((c) => c.missed));
  }, [selectedOption]);

  const onEdit = () => {
    let editingNew = !isEditing;
    editing.value = editingNew ? 0 : -30;
    setIsEditing(editingNew);
  };

  const onDelete = (item: {
    id: string;
    name: string;
    date: string;
    incoming: boolean;
    missed: boolean;
    img: string;
    video: boolean;
  }) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setItems(items.filter((i) => i.id !== item.id));
  };

  const animatedRowStyles = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: withTiming(editing.value) }],
    };
  });

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <Stack.Screen
        options={{
          headerTitle: () => (
            <SegmentedControl
              options={["All", "Missed"]}
              selectedOption={selectedOption}
              onOptionPress={setSelectedOption}
            />
          ),
          headerLeft: () => (
            <TouchableOpacity onPress={onEdit}>
              <Text style={{ color: Colors.primary, fontSize: 18 }}>
                {isEditing ? "Done" : "Edit"}
              </Text>
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <Animated.View style={defaultStyles.block} layout={transition}>
          <Animated.FlatList
            skipEnteringExitingAnimations
            scrollEnabled={false}
            data={items}
            keyExtractor={(item) => item.id.toString()}
            itemLayoutAnimation={transition}
            ItemSeparatorComponent={() => <View style={defaultStyles.separator} />}
            renderItem={({ item, index }) => (
              <SwipeableRow onDelete={() => onDelete(item)}>
                <Animated.View
                  style={{ flexDirection: "row", alignItems: "center" }}
                  entering={FadeInUp.delay(index * 10)}
                  exiting={FadeOutUp}
                >
                  <AnimatedTouchableOpacity
                    onPress={() => onDelete(item)}
                    style={[animatedRowStyles]}
                  >
                    <Ionicons name="remove-circle" size={24} color={Colors.red} />
                  </AnimatedTouchableOpacity>
                  <Animated.View style={[defaultStyles.item, animatedRowStyles]}>
                    <Image source={{ uri: item.img }} style={styles.avatar} />

                    <View style={{ flex: 1, gap: 2 }}>
                      <Text style={{ fontSize: 18, color: item.missed ? Colors.red : "#000" }}>
                        {item.name}
                      </Text>

                      <View style={{ flexDirection: "row", gap: 4 }}>
                        <Ionicons
                          name={item.video ? "videocam" : "call"}
                          size={16}
                          color={Colors.gray}
                        />
                        <Text style={{ color: Colors.gray, flex: 1 }}>
                          {item.incoming ? "Incoming" : "Outgoing"}
                        </Text>
                      </View>
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        gap: 6,
                        alignItems: "center",
                      }}
                    >
                      <Text style={{ color: Colors.gray }}>{format(item.date, "MM.dd.yy")}</Text>
                      <Ionicons
                        name="information-circle-outline"
                        size={24}
                        color={Colors.primary}
                      />
                    </View>
                  </Animated.View>
                </Animated.View>
              </SwipeableRow>
            )}
          />
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
});
