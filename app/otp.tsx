import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaskInput from "react-native-mask-input";
import { isClerkAPIResponseError, useSignIn, useSignUp } from "@clerk/clerk-expo";

export default function OTPPage() {
  const { signUp, setActive } = useSignUp();
  const { signIn } = useSignIn();
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState<{ masked: string; unmasked: string }>({
    masked: "",
    unmasked: "",
  });
  const router = useRouter();
  const keyboardVerticalOffset = Platform.OS === "ios" ? 90 : 0;
  const { bottom } = useSafeAreaInsets();

  const openLink = () => {};

  const sendOTP = async () => {
    setLoading(true);
    console.log({ phoneNumber });
    try {
      await signUp?.create({ phoneNumber: phoneNumber.unmasked });

      signUp?.preparePhoneNumberVerification();
      router.push(`/verify/${phoneNumber}`);
    } catch (error) {
      console.log("Error while sending OTP", error);
      if (isClerkAPIResponseError(error)) {
        if (error.errors[0].code === "form_identifier_exists") {
          console.log("Clear SignUP error - user exists");
          await trySignIn();
        } else {
          setLoading(false);
          Alert.alert("Error", error.errors[0].message);
        }
      }
    }
  };

  const trySignIn = async () => {
    console.log("trySignIn", phoneNumber);

    try {
      const { supportedFirstFactors } = await signIn!.create({
        identifier: phoneNumber.unmasked,
      });

      // TODO: fix any
      const firstPhoneFactor: any = supportedFirstFactors.find((factor: any) => {
        return factor.strategy === "phone_code";
      });

      const { phoneNumberId } = firstPhoneFactor;

      await signIn!.prepareFirstFactor({
        strategy: "phone_code",
        phoneNumberId,
      });

      router.push(`/verify/${phoneNumber}?signin=true`);
      setLoading(false);
    } catch (error) {
      console.log("Error while trying to signIn OTP page", error);
      setLoading(false);
      if (isClerkAPIResponseError(error)) {
        Alert.alert("Error", error.errors[0].message);
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      keyboardVerticalOffset={keyboardVerticalOffset}
      behavior="padding"
    >
      <View style={styles.container}>
        {loading && (
          <View style={[StyleSheet.absoluteFill, styles.loading]}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={{ padding: 10, fontSize: 18 }}>Sending code...</Text>
          </View>
        )}
        <Text style={styles.description}>
          Swiper will need to verify your account. Carrier charges may apply.
        </Text>
        <View style={styles.list}>
          <View style={styles.listItem}>
            <Text style={styles.listItemText}>Australia</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.gray} />
          </View>
          <View style={styles.seperator} />

          <MaskInput
            style={styles.input}
            value={phoneNumber.masked}
            keyboardType="numeric"
            autoFocus
            placeholder="+61 your phone number"
            onChangeText={(masked, unmasked) => {
              setPhoneNumber({ masked, unmasked: `+61 ${unmasked}` });
            }}
            mask={[
              "(",
              "+",
              "6",
              "1",
              ")",
              " ",
              /\d/,
              /\d/,
              " ",
              /\d/,
              /\d/,
              /\d/,
              /\d/,
              /\d/,
              "-",
              /\d/,
              /\d/,
              /\d/,
            ]}
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
          style={[
            styles.button,
            phoneNumber.masked !== "" ? styles.enabled : null,
            { marginBottom: bottom },
          ]}
          disabled={phoneNumber.masked === ""}
          onPress={sendOTP}
        >
          <Text style={[styles.buttonText, phoneNumber.masked !== "" ? styles.enabled : null]}>
            Next
          </Text>
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
    fontWeight: "500",
  },
  input: {
    backgroundColor: "#fff",
    width: "100%",
    fontSize: 16,
    padding: 6,
    marginTop: 10,
  },
  loading: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
});
