import Colors from "@/constants/Colors";
import Toast, { ToastType } from "react-native-toast-message";

export function showToast(textPrimary: string, textSecondary: string, type: ToastType) {
  Toast.show({
    type: type,
    text1: textPrimary,
    text2: textSecondary,
    text1Style: { fontFamily: "SF_Pro_Display_Bold", fontSize: 18, color: Colors.textDark },
    text2Style: {
      fontFamily: "SF_Pro_Display_Regular",
      fontSize: 16,
      color: Colors.textLight,
    },
    swipeable: true,
    autoHide: true,
    visibilityTime: 3000,
  });
}
