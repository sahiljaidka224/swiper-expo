import Avatar from "@/components/Avatar";
import Colors from "@/constants/Colors";
import { useAuth } from "@/context/AuthContext";
import {
  View,
  ScrollView,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Alert,
} from "react-native";
import Text from "@/components/Text";
import * as Application from "expo-application";
import { Controller, useForm } from "react-hook-form";
import Button from "@/components/Button";
import { useUpdateUserAvatar, useUpdateUserDetails } from "@/api/hooks/user";
import { useCallback, useEffect } from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useActionSheet } from "@expo/react-native-action-sheet";
import * as ImagePicker from "expo-image-picker";
import * as Linking from "expo-linking";
import * as FileSystem from "expo-file-system";
import ErrorView from "@/components/Error";
import { router } from "expo-router";
import { CometChat } from "@cometchat/chat-sdk-react-native";

type FormData = {
  firstName: string;
  lastName: string;
  dealershipName: string;
};

const options = ["Gallery", "Camera", "Cancel"];

interface ProfileProps {
  context: "update" | "create";
}

export default function ProfileComponent({ context }: ProfileProps) {
  const { showActionSheetWithOptions } = useActionSheet();
  const { logout, user, token, updateUser } = useAuth();
  const { updateUserDetails, updatedUserDetails, isMutating, error } = useUpdateUserDetails();
  const { updateUserAvatar, isUserAvatarMutating, error: avatarError } = useUpdateUserAvatar();
  const keyboardVerticalOffset = Platform.OS === "ios" ? 90 : 0;

  const [cameraStatus, requestCameraPermission] = ImagePicker.useCameraPermissions();

  const name = user?.name.split(" ");
  const firstName = name?.[0] ?? "";
  const lastName = name?.[1] ?? "";

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    getValues,
  } = useForm<FormData>({
    defaultValues: {
      firstName: firstName,
      lastName: lastName,
      dealershipName: user?.org?.name ?? "",
    },
  });

  useEffect(() => {
    if (!isMutating && updatedUserDetails && !error && user) {
      updateUser({
        ...user,
        name: `${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`,
        phoneNumber: updatedUserDetails.phoneNumber,
        profileComplete: true,
      });

      if (context === "create") {
        router.replace("/(tabs)/(chats)");
      }
    }
  }, [updatedUserDetails]);

  const onSubmit = ({ firstName, lastName, dealershipName }: FormData) => {
    if (!token || !isEnabled()) return;

    if (firstName.trimEnd() === "" || lastName.trimEnd() === "") {
      Alert.alert("Error", "First Name and Last Name are required");
      return;
    }

    if (context === "create") {
      updateUserDetails({
        userDetails: {
          firstName,
          lastName,
          dealershipName,
          phoneNumber: user?.phoneNumber,
          profileWizardComplete: 1,
        },
        token,
      });
      return;
    }
    updateUserDetails({
      userDetails: { firstName, lastName },
      token,
    });
  };

  const onPickImageFromCamera = async () => {
    if (cameraStatus) {
      if (
        cameraStatus.status === ImagePicker.PermissionStatus.UNDETERMINED ||
        (cameraStatus.status === ImagePicker.PermissionStatus.DENIED && cameraStatus.canAskAgain)
      ) {
        const permission = await requestCameraPermission();
        if (permission.granted) {
          await handleLaunchCamera();
        }
      } else if (cameraStatus.status === ImagePicker.PermissionStatus.DENIED) {
        await Linking.openSettings();
      } else {
        await handleLaunchCamera();
      }
    }
  };

  const handleLaunchCamera = useCallback(async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.5,
        aspect: [4, 3],
        allowsMultipleSelection: false,
      });
      if (!result.canceled) {
        if (result.assets.length > 0) {
          const base64 = await FileSystem.readAsStringAsync(result.assets[0].uri, {
            encoding: "base64",
          });
          if (!base64 || !token || !user?.id) return;
          updateUserAvatar({ token, avatar: base64, userId: user?.id });
        }
      }
    } catch (error) {
      console.log(error);
    }
  }, []);

  const onPickImageFromGallery = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
        allowsMultipleSelection: false,
      });

      if (!result.canceled) {
        if (result.assets.length > 0) {
          const base64 = await FileSystem.readAsStringAsync(result.assets[0].uri, {
            encoding: "base64",
          });

          if (!base64 || !token || !user?.id) return;
          updateUserAvatar({ token, avatar: base64, userId: user?.id });
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const onShowActionSheet = () => {
    const cancelButtonIndex = options.length - 1;

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
      },
      (buttonIndex: any) => {
        if (buttonIndex !== cancelButtonIndex) {
          switch (buttonIndex) {
            case 0:
              onPickImageFromGallery();
              break;

            default:
              onPickImageFromCamera();
              break;
          }
        }
      }
    );
  };

  // check if all the mandatory fields are filled
  const isEnabled = () => {
    if (context === "create") {
      return getValues("firstName").length > 0 && getValues("lastName").length > 0;
    }

    return isDirty;
  };

  const onLogout = async () => {
    await CometChat.logout().catch(() => null);
    logout();
  };

  return (
    <KeyboardAvoidingView
      style={{
        flex: 1,
        backgroundColor: Colors.background,
      }}
      keyboardVerticalOffset={keyboardVerticalOffset}
      behavior="padding"
    >
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View style={{ alignItems: "center", marginTop: 10, gap: 10 }}>
          {error || avatarError ? <ErrorView /> : null}
          {errors["firstName"] || errors["lastName"] ? (
            <ErrorView error="First Name and Last Name are required" />
          ) : null}

          {user && context === "update" ? (
            <Pressable style={{ height: 125, width: 125 }} onPress={onShowActionSheet}>
              <View style={{ position: "absolute", top: 0, right: 0, zIndex: 10 }}>
                <Pressable>
                  <MaterialIcons name="mode-edit" size={30} color={Colors.primary} />
                </Pressable>
              </View>
              <Avatar userId={user?.id} />
            </Pressable>
          ) : (
            <View style={styles.headingWrapper}>
              <Text style={styles.heading}>What are your details?</Text>
              <Text style={styles.desc}>We ensure all our users are verified car dealers.</Text>
            </View>
          )}
        </View>
        <View style={{ padding: 20, gap: 20 }}>
          <Controller
            control={control}
            rules={{
              required: true,
              minLength: 1,
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                placeholder="First Name"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                style={[styles.textInput, { flex: 1 }]}
                maxFontSizeMultiplier={1.3}
              />
            )}
            name="firstName"
          />
          <Controller
            control={control}
            rules={{
              required: true,
              minLength: 1,
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                placeholder="Last Name"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                style={[styles.textInput, { flex: 1 }]}
                maxFontSizeMultiplier={1.3}
              />
            )}
            name="lastName"
          />
          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                placeholder="Dealership Name"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                style={[styles.textInput, { flex: 1 }]}
                maxFontSizeMultiplier={1.3}
                readOnly={context === "update"}
              />
            )}
            name="dealershipName"
          />

          <TextInput
            value={user?.phoneNumber}
            style={styles.textInput}
            maxFontSizeMultiplier={1.3}
            readOnly
          />

          {Application.nativeApplicationVersion && context === "update" ? (
            <TextInput
              value={Application.nativeApplicationVersion}
              style={styles.textInput}
              maxFontSizeMultiplier={1.3}
              readOnly
            />
          ) : null}
        </View>

        <View style={{ paddingHorizontal: 20, gap: 15 }}>
          <Button
            title={context === "update" ? "Update" : "Create Profile"}
            onPress={handleSubmit(onSubmit)}
            isLoading={isMutating || isUserAvatarMutating}
            disabled={isMutating}
            type={isEnabled() ? "primary" : "disabled"}
          />
          {context === "update" && <Button type="secondary" title="Logout" onPress={onLogout} />}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  textInput: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 15,
    backgroundColor: Colors.lightGrayBackground,
    borderColor: Colors.borderGray,
    fontFamily: "SF_Pro_Display_Regular",
    fontSize: 20,
    color: Colors.textDark,
    textTransform: "capitalize",
  },
  headingWrapper: {
    padding: 10,
    gap: 5,
  },
  heading: {
    fontSize: 24,
    fontFamily: "SF_Pro_Display_Bold",
    color: Colors.textDark,
  },
  desc: {
    fontSize: 16,
    fontFamily: "SF_Pro_Display_Medium",
    color: Colors.textDark,
  },
});

/* {[devices, items, support].map((x, index) => (
          <View key={index} style={defaultStyles.block}>
            <FlatList
              scrollEnabled={false}
              data={x}
              ItemSeparatorComponent={() => <View style={defaultStyles.separator} />}
              renderItem={({ item }) => (
                <View style={defaultStyles.item}>
                  <BoxedIcon name={item.icon} backgroundColor={item.backgroundColor} />
                  <Text style={{ fontSize: 18, flex: 1 }}>{item.name}</Text>
                  <Ionicons name="chevron-forward" size={20} color={Colors.gray} />
                </View>
              )}
            />
          </View>
        ))} */