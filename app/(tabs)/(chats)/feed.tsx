import { StyleSheet } from "react-native";
import WebView from "react-native-webview";

export default function FeedPage() {
  return (
    <WebView
      style={styles.container}
      originWhitelist={["*"]}
      source={{ uri: "https://www.carexpert.com.au/" }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
