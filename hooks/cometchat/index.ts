import { CometChat } from "@cometchat/chat-sdk-react-native";

export async function cometChatInit() {
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
        await CometChat.login(
          "4d306670-e733-11ee-95bb-d90b8dbd243d",
          process.env.EXPO_PUBLIC_COMET_CHAT_AUTH_KEY
        );

        console.log("logggg");
        return true;
      } else {
        return true;
      }
    } catch (loginError) {
      console.log("Login failed with exception:", { loginError });
      return false;
    }
  } catch (error) {
    console.log("Initialization or getLoggedinUser failed with error:", error);
    return false;
  }

  // CometChat.init(process.env.EXPO_PUBLIC_COMET_CHAT_APP_ID, appSetting).then(
  //   () => {
  //     CometChat.getLoggedinUser().then(
  //       (user: CometChat.User | null) => {
  //         if (!user) {
  //           // TODO: create user if doesn't exists
  //           CometChat.login(
  //             "4d306670-e733-11ee-95bb-d90b8dbd243d",
  //             process.env.EXPO_PUBLIC_COMET_CHAT_AUTH_KEY
  //           ).then(
  //             (user: CometChat.User) => {
  //               console.log("Login Successful:", { user });
  //               router.replace("/(tabs)/chats");
  //             },
  //             (error: CometChat.CometChatException) => {
  //               console.log("Login failed with exception:", { error });
  //             }
  //           );
  //         }
  //       },
  //       (error: CometChat.CometChatException) => {
  //         console.log("Some Error Occured", { error });
  //       }
  //     );
  //   },
  //   (error) => {
  //     console.log("Initialization failed with error:", error);
  //   }
  // );
}
