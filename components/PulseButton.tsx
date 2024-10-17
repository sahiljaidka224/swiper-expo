import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import Button, { ButtonProps } from "./Button";
import Colors from "@/constants/Colors";

export default function PulseButton(props: ButtonProps) {
  const scaleValue = useRef(new Animated.Value(1)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacityValue, {
          toValue: 0.3,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.parallel([
          Animated.timing(scaleValue, {
            toValue: 1.5,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(opacityValue, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    pulseAnimation.start();
  }, [scaleValue, opacityValue]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.bg,
          {
            transform: [{ scale: scaleValue }],
            opacity: opacityValue,
          },
        ]}
      />
      <View style={styles.buttonContainer}>
        <Button {...props} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
  },
  bg: {
    position: "absolute",
    width: "80%",
    height: "100%",
    borderRadius: 30,
    backgroundColor: Colors.primary,
  },
  buttonContainer: {
    width: "80%",
    paddingHorizontal: 20,
    justifyContent: "center",
    height: 50,
  },
});
