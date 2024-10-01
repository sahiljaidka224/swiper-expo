import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { CometChat } from "@cometchat/chat-sdk-react-native";
import { Platform } from "react-native";
import messaging from "@react-native-firebase/messaging";

function handleRegistrationError(errorMessage: string) {
  throw new Error(errorMessage);
}

async function registerForPushNotificationsAsync() {
  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
        },
      });
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      handleRegistrationError("Permission not granted to get push token for push notification!");
      return;
    }

    try {
      const FCM_TOKEN = await messaging().getToken();
      return FCM_TOKEN;
    } catch (e: unknown) {
      handleRegistrationError(`${e}`);
    }
  } else {
    handleRegistrationError("Must use physical device for push notifications");
  }
}

export async function cometChatInit(userId: string, userName: string | null = null) {
  let appSetting = new CometChat.AppSettingsBuilder()
    .subscribePresenceForAllUsers()
    .setRegion(process.env.EXPO_PUBLIC_COMET_CHAT_APP_REGION ?? "")
    .autoEstablishSocketConnection(true)
    .build();

  try {
    await CometChat.init(process.env.EXPO_PUBLIC_COMET_CHAT_APP_ID, appSetting);
    const user = await CometChat.getLoggedinUser();

    try {
      if (!user) {
        await CometChat.login(userId, process.env.EXPO_PUBLIC_COMET_CHAT_AUTH_KEY);
        registerForPushNotificationsAsync()
          .then(async (FCM_TOKEN) => {
            if (FCM_TOKEN) {
              await CometChat.registerTokenForPushNotification(FCM_TOKEN);
            }
          })
          .catch((error) => {
            console.log("Error while trying to register token for push notification", error);
          });

        return true;
      } else {
        registerForPushNotificationsAsync()
          .then(async (FCM_TOKEN) => {
            if (FCM_TOKEN) {
              await CometChat.registerTokenForPushNotification(FCM_TOKEN);
            }
          })
          .catch((error) => {
            console.log("Error while trying to register token for push notification", error);
          });
        return true;
      }
    } catch (loginError) {
      console.log("Login failed with exception:", { loginError });
      if (userName && (loginError as any).code === "ERR_UID_NOT_FOUND") {
        return createCometChatUser(userId, userName);
      } else {
        console.log("Failed to create user as no name provided");
      }
      return false;
    }
  } catch (error) {
    console.log("Initialization or getLoggedinUser failed with error:", error);
    return false;
  }
}

// TODO: Move to backend
export async function createCometChatUser(uid: string, name: string) {
  try {
    const user = new CometChat.User(uid);
    user.setName(name);
    try {
      const newUser = await CometChat.createUser(
        user,
        process.env.EXPO_PUBLIC_COMET_CHAT_AUTH_KEY!
      );
      if (newUser) {
        const newUserUID = newUser.getUid();
        await cometChatInit(newUserUID);

        const splitName = name.split(" ");
        let firstName: string = name;
        if (splitName.length > 1) {
          firstName = splitName[0];
        }

        const message = `Hello ${firstName}, Welcome to Swiper messaging..\n\nFor a great experience invite your phone contacts.\n\nGet chatting, create opportunites and enjoy!!`;
        await sendBotMessage(newUserUID, message);

        return true;
      }
    } catch (error) {
      console.log("Error while creating USER in CometChat", error);
    }
  } catch (error) {
    console.log("Create user failed with error:", error);
    return false;
  }
}

async function sendBotMessage(receiverID: string, messageText: string) {
  try {
    const options = {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        apikey: process.env.EXPO_PUBLIC_COMET_CHAT_REST_API_KEY!,
      },
      body: JSON.stringify({
        category: "message",
        type: "text",
        receiver: receiverID,
        receiverType: "USER",
        data: {
          text: messageText,
        },
      }),
    };

    fetch(
      `https://${process.env.EXPO_PUBLIC_COMET_CHAT_APP_ID}.api-in.cometchat.io/v3/bots/${process.env.EXPO_PUBLIC_ADMIN_USER_ID}/messages`,
      options
    )
      .then((response) => response.json())
      .then((response) => console.log(response))
      .catch((err) => console.log("Error while trying to send message as SWIPER ADMIN", err));
  } catch (error) {
    console.log("Error while trying to send message as SWIPER ADMIN", error);
  }
}
