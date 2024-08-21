import { Text as RNText, StyleSheet, TextProps } from "react-native";

export default function Text(props: TextProps) {
  return (
    <RNText {...props} style={[styles.text, props.style]}>
      {props.children}
    </RNText>
  );
}

const styles = StyleSheet.create({
  text: {
    letterSpacing: 0.2,
  },
});
