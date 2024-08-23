import Colors from "@/constants/Colors";
import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaskInput from "react-native-mask-input";
import { useLoginWithPhone } from "@/api/hooks/user";
import ErrorView from "@/components/Error";
import { useAuth } from "@/context/AuthContext";
import Text from "@/components/Text";

const phoneNumberMask = [
  // "(",
  // "+",
  // "6",
  // "1",
  // ")",
  "(",
  "0",
  /\d/,
  ")",
  " ",
  /\d/,
  /\d/,
  /\d/,
  " ",
  /\d/,
  /\d/,
  /\d/,
  " ",
  /\d/,
  /\d/,
];

export default function OTPPage() {
  const { error, loginWithPhone, userInfo, isMutating } = useLoginWithPhone();
  const { login } = useAuth();

  const [phoneNumber, setPhoneNumber] = useState<{ masked: string; unmasked: string }>({
    masked: "",
    unmasked: "",
  });
  const [password, setPassword] = useState<string>("");
  const keyboardVerticalOffset = Platform.OS === "ios" ? 90 : 0;
  const { bottom } = useSafeAreaInsets();

  useEffect(() => {
    if (!isMutating && userInfo) {
      if (userInfo && userInfo?.token) {
        login(userInfo.token, {
          id: userInfo?.userId,
          name: `${userInfo?.firstName} ${userInfo?.lastName}`,
          phoneNumber: userInfo?.phoneNumber,
          profileComplete: userInfo?.profileWizardComplete,
        });
      }
    }
  }, [userInfo, isMutating]);

  const openLink = () => {};

  const loginUsingPhone = async () => {
    try {
      loginWithPhone({ phoneNumber: phoneNumber.unmasked, password });
    } catch (error) {
      console.log("Error while login", error);
    }
  };

  const isInputValid = () => {
    return phoneNumber.unmasked.length === 10 && password.length >= 6;
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      keyboardVerticalOffset={keyboardVerticalOffset}
      behavior="padding"
    >
      <View style={styles.container}>
        {/* {loading && (
          <View style={[StyleSheet.absoluteFill, styles.loading]}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={{ padding: 10, fontSize: 18 }}>Sending code...</Text>
          </View>
        )} */}
        {error && <ErrorView />}
        <Text style={styles.description}>
          Swiper will need to verify your account. Carrier charges may apply.
        </Text>
        <View style={styles.list}>
          <View style={styles.listItem}>
            <Text style={styles.listItemText}>Australia</Text>
          </View>
          <View style={styles.seperator} />

          <MaskInput
            style={styles.input}
            value={phoneNumber.masked}
            keyboardType="numeric"
            autoFocus
            placeholder="04 131 313 13"
            placeholderTextColor={Colors.textLight}
            onChangeText={(masked, unmasked) => {
              setPhoneNumber({ masked, unmasked: `0${unmasked.replaceAll(" ", "")}` });
            }}
            mask={phoneNumberMask}
            maxFontSizeMultiplier={1.3}
          />
          <View style={styles.seperator} />

          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            onChangeText={setPassword}
            placeholderTextColor={Colors.textLight}
            maxFontSizeMultiplier={1.3}
          />
        </View>
        <Text style={styles.legal}>
          You must be{" "}
          <Text style={styles.link} onPress={openLink}>
            at least 16 years old{" "}
          </Text>
          to register. Learn how Swiper works with the{" "}
          <Text style={styles.link} onPress={openLink}>
            Companies
          </Text>
          .
        </Text>

        <View style={{ flex: 1 }} />

        <TouchableOpacity
          style={[styles.button, isInputValid() ? styles.enabled : null, { marginBottom: bottom }]}
          disabled={!isInputValid() && !isMutating}
          onPress={loginUsingPhone}
        >
          {isMutating ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={[styles.buttonText, isInputValid() ? styles.enabled : null]}>Next</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 20,
    backgroundColor: Colors.background,
    gap: 20,
  },
  description: {
    fontSize: 14,
    color: Colors.gray,
    fontFamily: "SF_Pro_Display_Regular",
    textAlign: "center",
  },
  list: {
    backgroundColor: "#fff",
    width: "100%",
    borderRadius: 10,
    padding: 10,
  },
  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 6,
    marginBottom: 10,
  },
  listItemText: {
    fontSize: 18,
    color: Colors.primary,
    fontFamily: "SF_Pro_Display_Regular",
  },
  seperator: {
    width: "100%",
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.gray,
    opacity: 0.3,
  },
  link: {
    color: Colors.primary,
  },
  legal: {
    fontSize: 12,
    textAlign: "center",
    color: "#000",
    fontFamily: "SF_Pro_Display_Regular",
  },
  button: {
    width: "100%",
    alignItems: "center",
    backgroundColor: Colors.lightGray,
    padding: 10,
    borderRadius: 10,
  },
  enabled: {
    backgroundColor: Colors.primary,
    color: "#fff",
  },
  buttonText: {
    color: Colors.gray,
    fontSize: 22,
    fontFamily: "SF_Pro_Display_Medium",
  },
  input: {
    backgroundColor: "#fff",
    width: "100%",
    fontSize: 16,
    fontFamily: "SF_Pro_Display_Regular",
    padding: 6,
    marginTop: 10,
    marginVertical: 6,
    letterSpacing: 0.5,
  },
  loading: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
});
