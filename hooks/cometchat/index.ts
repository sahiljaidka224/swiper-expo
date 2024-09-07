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
      const newUserUID = newUser.getUid();
      await cometChatInit(newUserUID);

      const messages = [
        `Hello ${name}, Welcome to swiper messaging app... we hope its a great experience for you!`,
        "Have a look around the app. There are loads of great features and if you have any questions at all, you can always message us here.",
        "Find your phone and Swiper contacts via the search on the Chat page. \n \nGet chatting, create opportunities and buy and sell some cars!!",
      ];
      for (const message of messages) {
        await sendBotMessage(newUserUID, message);
      }
      return true;
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
