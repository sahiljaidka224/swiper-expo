import React, { useCallback, useEffect, useRef, useState } from "react";
import { View, StyleSheet, FlatList, Dimensions, TouchableWithoutFeedback } from "react-native";
import { ResizeMode, Video } from "expo-av";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const videos = [
  { id: "1", uri: "https://videos.pexels.com/video-files/6873503/6873503-uhd_1440_2560_25fps.mp4" },
  { id: "2", uri: "https://videos.pexels.com/video-files/3066463/3066463-uhd_2732_1440_24fps.mp4" },
  { id: "3", uri: "https://videos.pexels.com/video-files/6872087/6872087-uhd_1440_2560_25fps.mp4" },
  { id: "4", uri: "https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4" },
];

const FullScreenVideoList = () => {
  const { top, bottom } = useSafeAreaInsets();
  const [visibleIndex, setVisibleIndex] = useState(0);

  const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: any[] }) => {
    if (viewableItems.length > 0) {
      setVisibleIndex(viewableItems[0].index);
    }
  }, []);

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  return (
    <View style={{ marginTop: 10 }}>
      <FlatList
        data={videos}
        renderItem={({ item, index }) => (
          <Post post={{ ...item, isPlaying: visibleIndex === index }} />
        )}
        showsVerticalScrollIndicator={false}
        snapToInterval={Dimensions.get("window").height - 130}
        snapToAlignment={"start"}
        decelerationRate={"fast"}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />
    </View>
  );
};

const Post = (props: { post: { uri: string; id: string; isPlaying: boolean } }) => {
  const [isPlaying, setPlaying] = useState(props.post.isPlaying);

  const onPlayPausePress = () => {
    setPlaying(!isPlaying);
  };

  useEffect(() => {
    setPlaying(props.post.isPlaying);
  }, [props.post.isPlaying]);

  return (
    <View style={styles.container}>
      <TouchableWithoutFeedback onPress={onPlayPausePress}>
        <View>
          <Video
            source={{ uri: props.post.uri }}
            style={styles.video}
            onError={(e) => console.log(e)}
            resizeMode={ResizeMode.COVER}
            shouldPlay={isPlaying}
            isLooping
            useNativeControls={false}
          />

          <View style={styles.uiContainer}></View>
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: Dimensions.get("window").height - 130,
  },

  video: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  uiContainer: {
    height: "100%",
    justifyContent: "flex-end",
  },
});

export default FullScreenVideoList;
