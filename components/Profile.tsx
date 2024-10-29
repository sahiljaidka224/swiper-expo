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
  Switch,
} from "react-native";
import Text from "@/components/Text";
import * as Application from "expo-application";
import { Controller, useForm } from "react-hook-form";
import Button from "@/components/Button";
import { useUpdateUserAvatar, useUpdateUserDetails } from "@/api/hooks/user";
import { useCallback, useEffect, useState } from "react";
import { useActionSheet } from "@expo/react-native-action-sheet";
import * as ImagePicker from "expo-image-picker";
import * as Linking from "expo-linking";
import * as FileSystem from "expo-file-system";
import ErrorView from "@/components/Error";
import { router, Stack, useNavigation } from "expo-router";
import { cometChatInit } from "@/hooks/cometchat";
import { useUpdateCometChatUser } from "@/hooks/cometchat/users";
import SimpleLineIcons from "@expo/vector-icons/build/SimpleLineIcons";
import { showToast } from "./Toast";
import * as MediaLibrary from "expo-media-library";
import { defaultStyles } from "@/constants/Styles";
import BoxedIcon from "./BoxedIcon";
import { Ionicons } from "@expo/vector-icons";
import { getCanPlaySwiperSound, setSwiperSound } from "@/context/settings";

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
  const [isSwipeSoundEnabled, setSwipeSoundEnabled] = useState(false);
  const { showActionSheetWithOptions } = useActionSheet();
  const { logout, user, token, updateUser } = useAuth();
  const { updateUserDetails, updatedUserDetails, isMutating, error } = useUpdateUserDetails();
  const {
    updateUserAvatar,
    isUserAvatarMutating,
    error: avatarError,
    data: avatarUpdateData,
  } = useUpdateUserAvatar();
  const {
    updateUser: updateCometChatUser,
    loading: isUpdateCometChatUserLoading,
    error: errorCometChat,
  } = useUpdateCometChatUser();
  const keyboardVerticalOffset = Platform.OS === "ios" ? 90 : 0;

  const [cameraStatus, requestCameraPermission] = ImagePicker.useCameraPermissions();

  const name = user?.name.split(" ");
  const firstName = name?.[0] ?? "";
  const lastName = name?.[1] ?? "";

  const navigation = useNavigation();

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    watch,
  } = useForm<FormData>({
    defaultValues: {
      firstName: firstName,
      lastName: lastName,
      dealershipName: user?.org?.name ?? "",
    },
  });

  useEffect(() => {
    (async () => {
      const canPlay = await getCanPlaySwiperSound();
      setSwipeSoundEnabled(canPlay);
    })();
  }, []);

  useEffect(() => {
    if (avatarUpdateData && !avatarError && !isUserAvatarMutating) {
      showToast("Success", "Profile Picture Updated Successfully", "success");
    }
  }, [avatarUpdateData, avatarError, isUserAvatarMutating]);

  useEffect(() => {
    if (!isMutating && updatedUserDetails && !error && user) {
      updateUser({
        ...user,
        name: `${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`,
        phoneNumber: updatedUserDetails.phoneNumber,
        profileComplete: true,
      });

      if (context === "update") {
        updateCometChatUser(`${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`);
        Alert.alert("Success", "Profile Updated Successfully");
      }

      if (context === "create") {
        (async () => {
          try {
            const isSignupSuccess = await cometChatInit(
              user.id,
              `${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
            );
            if (isSignupSuccess) {
              router.replace("/(tabs)/(chats)");
            } else {
              Alert.alert("Error", "Failed to Create User, Please try again");
            }
          } catch (error) {
            console.log(error);
            Alert.alert("Error", "An error occurred. Please try again later.");
          }
        })();
      }
    }
  }, [updatedUserDetails, isMutating, error]);

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
          displayName: `${firstName} ${lastName}`,
        },
        token,
      });
      return;
    }
    updateUserDetails({
      userDetails: { firstName, lastName, displayName: `${firstName} ${lastName}` },
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
        cameraType: ImagePicker.CameraType.front,
      });
      if (!result.canceled) {
        if (result.assets.length > 0 && result.assets[0].uri) {
          const base64 = await FileSystem.readAsStringAsync(result.assets[0].uri, {
            encoding: "base64",
          });

          MediaLibrary.saveToLibraryAsync(result.assets[0].uri)
            .then()
            .catch(() => showToast("Error", "Please allow Swiper to save images.", "error"));

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
        if (result.assets.length > 0 && result.assets[0].uri) {
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
      return watch("firstName").length > 0 && watch("lastName").length > 0;
    }

    return isDirty;
  };

  const onLogout = async () => {
    console.log(navigation.getState());
    // router.push("/asdasdasd/sadasd/asdadasdar");
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
      <Stack.Screen
        options={{
          headerRight: () => {
            if (context === "update")
              return (
                <Pressable onPress={onLogout}>
                  <SimpleLineIcons name="logout" size={24} color={Colors.primary} />
                </Pressable>
              );
          },
        }}
      />
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View style={{ alignItems: "center", marginTop: 10, gap: 10 }}>
          {error || avatarError ? <ErrorView /> : null}
          {errors["firstName"] || errors["lastName"] ? (
            <ErrorView error="First Name and Last Name are required" />
          ) : null}

          {user && context === "update" ? (
            <Pressable style={{ height: 125, width: 125 }} onPress={onShowActionSheet}>
              <Avatar userId={user?.id} showOnlineIndicator />
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
                placeholder="Dealership Name (Optional)"
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
          <View style={defaultStyles.item}>
            <BoxedIcon name={"megaphone"} backgroundColor={Colors.green} />
            <Text style={{ fontSize: 18, flex: 1, fontFamily: "SF_Pro_Display_Regular" }}>
              Swipe sound
            </Text>
            <Switch
              trackColor={{ false: "#767577", true: Colors.primary }}
              thumbColor={isSwipeSoundEnabled ? Colors.background : "#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={() => {
                setSwipeSoundEnabled(!isSwipeSoundEnabled);
                setSwiperSound(!isSwipeSoundEnabled);
              }}
              value={isSwipeSoundEnabled}
            />
          </View>
        </View>

        <View style={{ paddingHorizontal: 20, gap: 15 }}>
          <Button
            title={context === "update" ? "Update" : "Create Profile"}
            onPress={handleSubmit(onSubmit)}
            isLoading={isMutating || isUserAvatarMutating}
            disabled={isMutating}
            type={isEnabled() ? "primary" : "disabled"}
          />
          {context === "update" && (
            <View
              style={{
                justifyContent: "flex-end",
              }}
            >
              <Button
                title="Invite Phone Contacts"
                onPress={() => router.push("/(tabs)/(chats)/invite-friends")}
                isLoading={isUpdateCometChatUserLoading}
              />
            </View>
          )}
          <Text style={styles.versionText}>
            Version:{" "}
            {Application.nativeApplicationVersion ? Application.nativeApplicationVersion : ""} (
            {Application.nativeBuildVersion ? Application.nativeBuildVersion : ""})
          </Text>
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
  versionText: {
    fontFamily: "SF_Pro_Display_Light",
    fontSize: 16,
    textAlign: "center",
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
