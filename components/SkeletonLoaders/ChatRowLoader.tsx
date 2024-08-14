import Colors from "@/constants/Colors";
import React from "react";
import ContentLoader, { Rect, Circle, IContentLoaderProps } from "react-content-loader/native";

const ChatRowLoader = (props: React.JSX.IntrinsicAttributes & IContentLoaderProps) => (
  <ContentLoader
    speed={1.5}
    width={350}
    height={100}
    viewBox="0 0 350 100"
    backgroundColor={Colors.lightGray}
    foregroundColor={Colors.lightGrayBackground}
    {...props}
  >
    <Rect x="78" y="8" rx="3" ry="3" width="100" height="6" />
    <Rect x="78" y="20" rx="3" ry="3" width="150" height="6" />
    <Rect x="78" y="46" rx="3" ry="3" width="225" height="6" />
    <Circle cx="40" cy="35" r="27" />
  </ContentLoader>
);

export default ChatRowLoader;
