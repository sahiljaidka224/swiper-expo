import React, { useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  View,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import axios from "axios";
import xml2js from "xml2js";
import { SafeAreaView, SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/Colors";
import { router } from "expo-router";
import FeedVideos from "@/components/FeedVideos";

// Type declarations
interface FeedItem {
  title: string[];
  description: string[];
  link: string[];
  enclosure?: [{ $: { url: string } }];
  "media:content"?: [{ $: { url: string } }];
  "content:encoded"?: string[];
}

const rssFeeds = [
  { url: "https://www.drive.com.au/feed/", title: "Drive Australia" },
  { url: "https://practicalmotoring.com.au/feed/", title: "Practical Motoring" },
  { url: "https://www.carexpert.com.au/feed", title: "Car Expert" },
  { url: "https://tradecartransport.com.au/feed", title: "Trade Car Transport" },
  { url: "https://timelesscarcleaning.com/feed/", title: "Timeless Car Cleaning" },
  { url: "https://www.autodaily.com.au/category/car-news/feed/", title: "Automotive Daily" },
  { url: "https://www.qldautoparts.com.au/feed", title: "QLD Auto Parts" },
  { url: "https://schmicko.com.au/feed/", title: "Schmicko" },
  { url: "https://www.caradvice.com.au/feed/", title: "Car Advice" },
];

// Function to remove HTML tags from a string
const removeHTMLTags = (str: string): string => {
  return str.replace(/<[^>]*>/g, "");
};

// Function to extract image URLs from the description
const extractImageUrl = (item: FeedItem): string | undefined => {
  if (!item.description || !item.description[0]) {
    return undefined;
  }

  const figureImgMatch = item.description[0].match(
    /<figure[^>]*>.*?<img[^>]+src=["']([^"']+)["'][^>]*>/
  );
  if (figureImgMatch && figureImgMatch[1]) {
    return figureImgMatch[1];
  }

  const srcSetMatch = item.description[0].match(/<img[^>]+srcSet=["']([^"']+)["']/);
  if (srcSetMatch && srcSetMatch[1]) {
    const srcSet = srcSetMatch[1];
    const srcSetUrls = srcSet.split(",").map((entry) => entry.trim().split(" ")[0]);
    if (srcSetUrls.length > 0) {
      return srcSetUrls[srcSetUrls.length - 1]; // Get the highest resolution
    }
  }

  const imgTagMatch = item.description[0].match(/<img[^>]+src=["']([^"']+)["'][^>]*>/);
  if (imgTagMatch && imgTagMatch[1]) {
    return imgTagMatch[1];
  }

  if (item.enclosure && item.enclosure[0]?.$.url) {
    return item.enclosure[0].$.url;
  }

  if (item["media:content"] && item["media:content"][0]?.$.url) {
    return item["media:content"][0].$.url;
  }

  const backgroundImgMatch = item.description[0].match(
    /background-image\s*:\s*url\(['"]([^'"]+)['"]\)/
  );
  if (backgroundImgMatch && backgroundImgMatch[1]) {
    return backgroundImgMatch[1];
  }

  if (item["content:encoded"] && item["content:encoded"][0]) {
    const contentMatch = item["content:encoded"][0].match(/<img[^>]+src=["']([^"']+)["'][^>]*>/);
    if (contentMatch && contentMatch[1]) {
      return contentMatch[1];
    }
  }

  return undefined;
};

// Function to fetch RSS Feed
const fetchRSSFeed = async (
  url: string,
  setFeedData: React.Dispatch<React.SetStateAction<FeedItem[]>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  setLoading(true);
  try {
    const response = await axios.get(url);
    const parser = new xml2js.Parser();

    parser.parseString(response.data, (err: any, result: any) => {
      if (err) {
        console.error("Error parsing XML:", err);
        setLoading(false);
        return;
      }

      const items: FeedItem[] = result?.rss?.channel[0]?.item || [];
      setFeedData((prevItems) => [...prevItems, ...items]);
      setLoading(false);
    });
  } catch (error) {
    console.error("Error fetching RSS feed:", error);
    setLoading(false);
  }
};

const AutomotiveRSSFeed: React.FC = () => {
  const [feedData, setFeedData] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedTab, setSelectedTab] = useState<string>("News");
  const { top, bottom } = useSafeAreaInsets();

  useEffect(() => {
    setFeedData([]);
    rssFeeds.forEach((feed) => {
      fetchRSSFeed(feed.url, setFeedData, setLoading);
    });
  }, []);

  const handleReadMore = (url: string) => {
    router.push({ pathname: "/(chats)/feed-readmore", params: { uri: url } });
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, selectedTab === "News" && styles.selectedButton]}
              onPress={() => {
                setSelectedTab("News");
              }}
            >
              <Text
                style={[styles.buttonText, selectedTab === "News" && styles.selectedButtonText]}
              >
                News
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, selectedTab === "Videos" && styles.selectedButton]}
              onPress={() => {
                setSelectedTab("Videos");
              }}
            >
              <Text
                style={[styles.buttonText, selectedTab === "Videos" && styles.selectedButtonText]}
              >
                Videos
              </Text>
            </TouchableOpacity>
          </View>
          {selectedTab === "News" ? (
            <ScrollView contentContainerStyle={styles.feedContainer}>
              {loading ? (
                <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />
              ) : (
                feedData.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.feedItem}
                    onPress={() => handleReadMore(item.link[0])} // Make the whole item clickable
                  >
                    <View style={styles.feedContent}>
                      {item.description && extractImageUrl(item) && (
                        <Image source={{ uri: extractImageUrl(item) }} style={styles.thumbnail} />
                      )}
                      <View style={styles.textContainer}>
                        <Text style={styles.itemTitle}>{item.title[0]}</Text>
                        <Text style={styles.description}>
                          {removeHTMLTags(item.description[0])}
                        </Text>
                        {/* "Read More" Button */}
                        <TouchableOpacity
                          style={styles.readMoreButton}
                          onPress={() => handleReadMore(item.link[0])}
                        >
                          <Text style={styles.readMoreText}>Read More</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          ) : (
            <>
              <FeedVideos top={top} bottom={bottom} />
            </>
          )}
        </>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  buttonContainer: {
    flexDirection: "row",
    marginTop: 10,
    backgroundColor: Colors.background,
    paddingHorizontal: 10,
    justifyContent: "center",
    gap: 10,
  },
  button: {
    backgroundColor: Colors.primaryLight,
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  buttonText: {
    color: Colors.textPrimary,
    fontWeight: "bold",
    fontSize: 16,
  },
  selectedButton: {
    backgroundColor: Colors.primary,
  },
  selectedButtonText: {
    color: Colors.textPrimary,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 10,
    paddingHorizontal: 10,
  },
  feedContainer: {
    padding: 10,
  },
  feedItem: {
    backgroundColor: Colors.background,
    marginBottom: 10,
    borderRadius: 8,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 2,
  },
  feedContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
    padding: 10,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  description: {
    fontSize: 14,
    color: "#333",
    marginTop: 5,
  },
  thumbnail: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  backButton: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
  },
  backButtonText: {
    color: Colors.textPrimary,
    fontWeight: "bold",
    fontSize: 16,
  },
  readMoreButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  readMoreText: {
    color: Colors.textPrimary,
    fontWeight: "bold",
    fontSize: 14,
  },
  loader: {
    marginTop: 50,
  },
});

export default AutomotiveRSSFeed;
