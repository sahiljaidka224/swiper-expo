import Colors from "@/constants/Colors";
import parseStringPromise from "@/utils/xml2js";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, View } from "react-native";
import WebView from "react-native-webview";
import Text from "@/components/Text";

export default function FeedPage() {
  const [loading, setLoading] = useState(true);
  const [rssData, setRssData] = useState<
    { title: any; link: any; description: any; pubDate: any }[]
  >([]);

  useEffect(() => {
    const fetchRSS = async () => {
      try {
        const response = await fetch("https://www.goauto.com.au/rss/news/35.xml");
        const textResponse = await response.text();

        // Parse XML with promise-based approach
        const result = (await parseStringPromise(textResponse)) as {
          rss: {
            channel: {
              item: { title: any[]; link: any[]; description: any[]; pubDate: any[] }[];
            }[];
          };
        };
        if (!result.rss || !result.rss.channel || !result.rss.channel[0].item) return;
        const items = result.rss.channel[0].item;

        // Map RSS data into a useful format
        const parsedItems = items.map(
          (item: { title: any[]; link: any[]; description: any[]; pubDate: any[] }) => ({
            title: item.title[0],
            link: item.link[0],
            description: item.description[0],
            pubDate: item.pubDate[0],
          })
        );

        setRssData(parsedItems);
      } catch (error) {
        console.error("Error fetching RSS feed:", error);
      } finally {
        setLoading(false);
      }
    };

    // fetchRSS();
  }, []);

  console.log(rssData);

  return (
    <>
      {loading && <ActivityIndicator size="large" color={Colors.primary} />}
      {/* <FlatList
        data={rssData}
        keyExtractor={(item) => item.link}
        renderItem={({ item }) => (
          <View>
            <Text style={{ fontWeight: "bold" }}>{item.title}</Text>
            <Text>{item.pubDate}</Text>
            <Text>{item.description}</Text>
          </View>
        )}
      /> */}
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
