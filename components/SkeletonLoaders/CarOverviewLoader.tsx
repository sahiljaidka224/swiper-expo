import Colors from "@/constants/Colors";
import React from "react";
import ContentLoader, { Rect, Circle, IContentLoaderProps } from "react-content-loader/native";

const CarOverviewLoader = (props: React.JSX.IntrinsicAttributes & IContentLoaderProps) => (
  <ContentLoader
    speed={1.5}
    width={400}
    height={150}
    viewBox="0 0 400 150"
    backgroundColor={Colors.lightGray}
    foregroundColor={Colors.lightGrayBackground}
    {...props}
  >
    <Rect x="-10" y="0" rx="12" ry="12" width="140" height="110" />
    <Rect x="150" y="10" rx="3" ry="3" width="200" height="10" />
    <Rect x="150" y="35" rx="3" ry="3" width="80" height="6" />
    <Rect x="150" y="50" rx="3" ry="3" width="80" height="6" />
    <Rect x="150" y="60" rx="3" ry="3" width="80" height="6" />
    <Rect x="150" y="70" rx="3" ry="3" width="80" height="6" />
  </ContentLoader>
);

export default CarOverviewLoader;
