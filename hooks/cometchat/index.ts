import { CometChat } from "@cometchat/chat-sdk-react-native";

export async function cometChatInit(userId: string) {
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
}
