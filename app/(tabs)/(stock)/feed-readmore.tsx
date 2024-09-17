import Colors from "@/constants/Colors";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, StyleSheet } from "react-native";
import WebView from "react-native-webview";

export default function ReadmorePage() {
  const { uri } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);

  return (
    <>
      {loading && <ActivityIndicator size="large" color={Colors.primary} />}
      <WebView
        style={styles.container}
        originWhitelist={["*"]}
        onLoadEnd={() => setLoading(false)}
        source={{ uri: uri as string }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
