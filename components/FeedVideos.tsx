import Colors from "@/constants/Colors";
import { Video, ResizeMode } from "expo-av";
import React, { useCallback, useRef, useState } from "react";
import { Dimensions, View, FlatList, StyleSheet, ViewToken } from "react-native";

const { height } = Dimensions.get("screen");

const data = [
  "https://videos.pexels.com/video-files/6873503/6873503-uhd_1440_2560_25fps.mp4",
  "https://videos.pexels.com/video-files/3066463/3066463-uhd_2732_1440_24fps.mp4",
  "https://videos.pexels.com/video-files/6872087/6872087-uhd_1440_2560_25fps.mp4",
  "https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4",
  "https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4",
  "https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4",
  "https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4",
];

export default function FeedVideos({ top, bottom }: { top: number; bottom: number }) {
  const [visibleIndex, setVisibleIndex] = useState(0);

  const onHandleViewableItemsChanged = useCallback(({ changed }: { changed: Array<ViewToken> }) => {
    const newVisibleIndex = changed.find((item) => item.isViewable)?.index;
    if (typeof newVisibleIndex === "number") {
      setVisibleIndex(newVisibleIndex);
    }
  }, []);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.background,
        marginTop: 5,
      }}
    >
      <FlatList
        style={{ flexGrow: 0, backgroundColor: Colors.background }}
        data={data}
        keyExtractor={(item, index) => String(index)}
        renderItem={({ item, index }) => (
          <VideoPlayer item={{ uri: item, top, bottom, isPlaying: visibleIndex === index }} />
        )}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        getItemLayout={(_, index) => {
          const ITEM_HEIGHT = height - top - bottom - 135;
          return {
            length: ITEM_HEIGHT,
            offset: ITEM_HEIGHT * index,
            index,
          };
        }}
        onViewableItemsChanged={onHandleViewableItemsChanged}
        onEndReachedThreshold={0.5}
      />
    </View>
  );
}

function VideoPlayer({
  item,
}: {
  item: { uri: string; top: number; bottom: number; isPlaying: boolean };
}) {
  const { uri, top, bottom, isPlaying } = item;
  const video = useRef(null);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.background,
        justifyContent: "center",
        height: height - top - bottom - 135,
      }}
    >
      <Video
        ref={video}
        style={styles.video}
        source={{
          uri,
        }}
        useNativeControls={false}
        shouldPlay={isPlaying}
        resizeMode={ResizeMode.COVER}
        isLooping
      />
    </View>
  );
}

const styles = StyleSheet.create({
  video: {
    alignSelf: "stretch",
    flex: 1,
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
});
