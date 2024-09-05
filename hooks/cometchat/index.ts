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

// TODO: Move to backend
export async function createCometChatUser(uid: string, name: string) {
  const user = new CometChat.User(uid);
  user.setName(name);
  try {
    const newUser = await CometChat.createUser(user, process.env.EXPO_PUBLIC_COMET_CHAT_AUTH_KEY!);
    if (newUser) {
      await cometChatInit(newUser.getUid());
      return true;
    }
  } catch (error) {
    console.log("Create user failed with error:", error);
    return false;
  }
}
