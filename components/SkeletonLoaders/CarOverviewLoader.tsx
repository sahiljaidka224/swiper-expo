import Colors from "@/constants/Colors";
import React from "react";
import ContentLoader, { Rect, Circle, IContentLoaderProps } from "react-content-loader/native";

const CarOverviewLoader = (props: React.JSX.IntrinsicAttributes & IContentLoaderProps) => (
  <ContentLoader
    speed={1.5}
    width={400}
    height={110}
    viewBox="0 0 400 110"
    backgroundColor={Colors.lightGray}
    foregroundColor={Colors.lightGrayBackground}
    {...props}
  >
    <Rect x="10" y="10" rx="12" ry="12" width="100" height="90" />
    <Rect x="120" y="10" rx="3" ry="3" width="200" height="8" />
    <Rect x="120" y="30" rx="3" ry="3" width="80" height="6" />
    <Rect x="120" y="40" rx="3" ry="3" width="80" height="6" />
    <Rect x="120" y="50" rx="3" ry="3" width="80" height="6" />
    <Rect x="120" y="60" rx="3" ry="3" width="80" height="6" />
  </ContentLoader>
);

export default CarOverviewLoader;
