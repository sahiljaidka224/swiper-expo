import Colors from "@/constants/Colors";
import * as React from "react";
import Svg, { G, Path, Defs, SvgProps } from "react-native-svg";

function PushCarIcon(props: SvgProps) {
  const { width = 36, height = 36, color = Colors.primary } = props;
  return (
    <Svg width={width} height={height} viewBox="0 0 36 36" fill="none" {...props}>
      <G filter="url(#prefix__filter0_d_285_11082)">
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M28.183 9.856h-2.527a2.62 2.62 0 01-2.178-1.165l-1.063-1.597a2.62 2.62 0 00-2.178-1.167h-5.053c-.875 0-1.693.439-2.179 1.165L11.942 8.69a2.617 2.617 0 01-2.178 1.166H7.237a2.618 2.618 0 00-2.618 2.618v14.4a2.618 2.618 0 002.618 2.618h20.946a2.62 2.62 0 002.618-2.618v-14.4a2.619 2.619 0 00-2.618-2.617zM17.71 26.873c-4.332 0-7.855-3.523-7.855-7.855 0-4.33 3.523-7.854 7.855-7.854 4.332 0 7.855 3.524 7.855 7.854 0 4.333-3.523 7.855-7.855 7.855zm-5.236-7.855a5.242 5.242 0 015.236-5.236 5.242 5.242 0 015.236 5.236 5.24 5.24 0 01-5.236 5.236 5.24 5.24 0 01-5.236-5.236z"
          fill={color}
        />
      </G>
      <Defs></Defs>
    </Svg>
  );
}

export default React.memo(PushCarIcon);
