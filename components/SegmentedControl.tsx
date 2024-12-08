import Colors from "@/constants/Colors";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated";
import Text from "./Text";

type SegmentedControlProps = {
  options: string[];
  selectedOption: string;
  onOptionPress?: (option: string) => void;
  width?: number;
};

const SegmentedControl: React.FC<SegmentedControlProps> = React.memo(
  ({ options, selectedOption, onOptionPress, width }) => {
    const internalPadding = 6;
    const segmentedControlWidth = width ? width : 150;

    const itemWidth = (segmentedControlWidth - internalPadding) / options.length;

    const rStyle = useAnimatedStyle(() => {
      return {
        left: withTiming(itemWidth * options.indexOf(selectedOption) + internalPadding / 2),
      };
    }, [selectedOption, options, itemWidth]);

    return (
      <View
        style={[
          styles.container,
          {
            width: segmentedControlWidth,
            paddingLeft: internalPadding / 2,
          },
        ]}
      >
        <Animated.View
          style={[
            {
              width: itemWidth,
            },
            rStyle,
            styles.activeBox,
          ]}
        />
        {options.map((option) => {
          return (
            <TouchableOpacity
              onPress={() => {
                onOptionPress?.(option);
              }}
              key={option}
              style={[
                {
                  width: itemWidth,
                },
                styles.labelContainer,
              ]}
            >
              <Text style={[styles.label, option === selectedOption ? styles.activeLabel : {}]}>
                {option}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    height: 40,
    backgroundColor: Colors.background,
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: Colors.borderGray,
    borderRadius: 12,
  },
  activeBox: {
    position: "absolute",
    borderRadius: 6,
    height: "80%",
    top: "10%",
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    borderWidth: 1,
  },
  labelContainer: { justifyContent: "center", alignItems: "center" },
  label: {
    fontSize: 18,
    fontFamily: "SF_Pro_Display_Medium",
    color: Colors.textDark,
  },
  activeLabel: {
    color: Colors.textPrimary,
  },
});

export { SegmentedControl };
