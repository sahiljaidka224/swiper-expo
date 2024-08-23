import Colors from "@/constants/Colors";
import { useState } from "react";
import { ActivityIndicator, StyleSheet } from "react-native";
import WebView from "react-native-webview";

export default function FeedPage() {
  const [loading, setLoading] = useState(true);

  return (
    <>
      {loading && <ActivityIndicator size="large" color={Colors.primary} />}
      <WebView
        style={styles.container}
        originWhitelist={["*"]}
        onLoadEnd={() => setLoading(false)}
        source={{ uri: "https://www.carexpert.com.au/" }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
