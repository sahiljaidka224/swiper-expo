import Colors from "@/constants/Colors";
import * as React from "react";
import Svg, { G, Path, Defs, SvgProps } from "react-native-svg";

function SwiperIcon(props: SvgProps) {
  const { width = 36, height = 36, color = Colors.primary } = props;

  return (
    <Svg width={width} height={height} viewBox="0 0 36 39" fill="none" {...props}>
      <G
        filter="url(#prefix__filter0_d_285_11070)"
        fillRule="evenodd"
        clipRule="evenodd"
        fill={color}
      >
        <Path d="M18.643 1S8.433 2.561 7.224 8.925c-1.21 6.364 4.11 10.848 4.11 10.848l-2.109 2.435 12.019 2.387s-4.14-5.334-6.134-8.077C13.117 13.775 4.663 5.632 18.643 1z" />
        <Path d="M17.162 34.008s10.21-1.561 11.419-7.925c1.21-6.364-4.11-10.849-4.11-10.849L26.58 12.8l-12.018-2.387s4.14 5.334 6.133 8.077c1.994 2.743 10.448 10.885-3.532 15.518z" />
      </G>
      <Defs></Defs>
    </Svg>
  );
}

export default React.memo(SwiperIcon);
