import Colors from "@/constants/Colors";
import { useEffect, useState } from "react";
import {
  Platform,
  StyleSheet,
  View,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaskInput from "react-native-mask-input";
import { useLoginWithPhone } from "@/api/hooks/user";
import ErrorView from "@/components/Error";
import { useAuth } from "@/context/AuthContext";
import Text from "@/components/Text";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";

const phoneNumberMask = [
  // "(",
  // "+",
  // "6",
  // "1",
  // ")",
  "0",
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
  /\d/,
];

export default function OTPPage() {
  const { error, loginWithPhone, userInfo, isMutating } = useLoginWithPhone();
  const { login } = useAuth();

  const [phoneNumber, setPhoneNumber] = useState<{ masked: string; unmasked: string }>({
    masked: "",
    unmasked: "",
  });
  const [secureTextEntry, setSecureTextEntry] = useState<boolean>(true);
  const [password, setPassword] = useState<string>("");
  const keyboardVerticalOffset = Platform.OS === "ios" ? 90 : 0;
  const { bottom } = useSafeAreaInsets();

  useEffect(() => {
    if (!isMutating && userInfo) {
      if (userInfo && !userInfo.isAccountApproved) {
        Alert.alert(
          "Account not approved",
          "Your account is not approved yet. Please try again later."
        );
        return;
      }
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
      behavior={"padding"}
      contentContainerStyle={{ flex: 1 }}
      keyboardVerticalOffset={100}
      style={{ flex: 1 }}
    >
      <View style={styles.container}>
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
            style={[
              styles.input,
              { color: phoneNumber.unmasked.length === 10 ? Colors.primary : Colors.textDark },
            ]}
            value={phoneNumber.masked}
            keyboardType="numeric"
            autoFocus
            placeholder="Enter Mobile Number"
            placeholderTextColor={Colors.gray}
            onChangeText={(masked, unmasked) => {
              setPhoneNumber({ masked, unmasked: `0${unmasked.replaceAll(" ", "")}` });
            }}
            mask={phoneNumberMask}
            maxFontSizeMultiplier={1.3}
          />
          <View style={styles.seperator} />
          <View style={styles.passwordContainer}>
            <TextInput
              style={[
                styles.input,
                { color: password.length >= 6 ? Colors.primary : Colors.textDark },
              ]}
              placeholder="Enter a Password"
              secureTextEntry={secureTextEntry}
              onChangeText={setPassword}
              placeholderTextColor={Colors.gray}
              maxFontSizeMultiplier={1.3}
              value={password}
            />
            <Pressable
              onPress={() => setSecureTextEntry(!secureTextEntry)}
              style={{ paddingRight: 20, paddingVertical: 10 }}
            >
              <Ionicons
                name={secureTextEntry ? "eye-off" : "eye"}
                size={20}
                color={Colors.iconGray}
              />
            </Pressable>
          </View>
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
    gap: 5,
  },
  description: {
    fontSize: 14,
    color: Colors.gray,
    fontFamily: "SF_Pro_Display_Regular",
    textAlign: "center",
  },
  list: {
    backgroundColor: Colors.background,
    width: "100%",
    borderRadius: 10,
    padding: 5,
  },
  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 6,
    marginBottom: 5,
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
    color: Colors.textDark,
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
    color: Colors.background,
  },
  buttonText: {
    color: Colors.gray,
    fontSize: 22,
    fontFamily: "SF_Pro_Display_Medium",
  },
  input: {
    backgroundColor: Colors.background,
    width: "100%",
    fontSize: 18,
    fontFamily: "SF_Pro_Display_Regular",
    padding: 6,
    marginTop: 10,
    marginVertical: 6,
    letterSpacing: 0.5,
  },
  loading: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginRight: 20,
  },
});
