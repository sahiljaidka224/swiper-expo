import Colors from "@/constants/Colors";
import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";

function StockIcon(props: SvgProps) {
  const { width = 36, height = 36, color = Colors.primary } = props;
  return (
    <Svg width={width} height={height} viewBox="0 0 36 36" fill="none" {...props}>
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M27.9 13.308h3.6v2.769h-2.614a.973.973 0 01.048.087c.026.051.051.102.091.143l2.08 2.132c.253.26.395.612.395.98v4.966c0 .765-.605 1.384-1.35 1.384H28.8c0 1.529-1.21 2.77-2.7 2.77-1.49 0-2.7-1.241-2.7-2.77H12.6c0 1.529-1.21 2.77-2.7 2.77-1.49 0-2.7-1.241-2.7-2.77H5.85c-.745 0-1.35-.619-1.35-1.384v-4.966c0-.368.142-.72.396-.979l2.079-2.132c.04-.04.065-.092.09-.143.016-.03.03-.06.049-.088H4.5v-2.77h3.6l1.492-4.59c.185-.567.7-.948 1.281-.948h14.254c.582 0 1.097.381 1.28.947l1.492 4.592zM7.2 20.23V23h5.4v-2.77H7.2zm21.6 0V23h-5.4v-2.77h5.4zm-17.55-9.693L9.9 16.078h16.2l-1.35-5.539h-13.5z"
        fill={color}
      />
    </Svg>
  );
}

export default React.memo(StockIcon);
