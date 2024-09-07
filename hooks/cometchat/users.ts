import { CometChat } from "@cometchat/chat-sdk-react-native";
import { useEffect, useState } from "react";

export const useGetCometChatUsers = () => {
  const [users, setUsers] = useState<CometChat.User[]>([]);
  const [error, setError] = useState<CometChat.CometChatException | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchUsers = async () => {
    try {
      let usersRequest = new CometChat.UsersRequestBuilder().setLimit(100).build();
      const users = await usersRequest.fetchNext();
      setUsers(users);
    } catch (error) {
      setError(error as CometChat.CometChatException);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return { users, error, loading, fetchUsers };
};

export const useGetCometChatUser = (uid: string) => {
  const [user, setUser] = useState<CometChat.User | null>(null);
  const [error, setError] = useState<CometChat.CometChatException | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let listenerID: string = `${uid}-online-indicator-listener`;

    CometChat.addUserListener(
      listenerID,
      new CometChat.UserListener({
        onUserOnline: (onlineUser: CometChat.User) => {
          setUser(onlineUser);
        },
        onUserOffline: (offlineUser: CometChat.User) => {
          setUser(offlineUser);
        },
      })
    );

    return () => {
      CometChat.removeMessageListener(listenerID);
    };
  }, []);

  const fetchUser = async () => {
    try {
      const user = await CometChat.getUser(uid);
      setUser(user);
    } catch (error) {
      setError(error as CometChat.CometChatException);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return { user, error, loading, fetchUser };
};

export const useUpdateCometChatUser = () => {
  const [error, setError] = useState<CometChat.CometChatException | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const updateUser = async (newName: string) => {
    setLoading(true);

    const user = await CometChat.getLoggedinUser();
    if (!user) return;

    user.setName(newName);

    try {
      const updatedUser = await CometChat.updateCurrentUserDetails(user);
      setLoading(false);
      return updatedUser;
    } catch (error) {
      setError(error as CometChat.CometChatException);
      setLoading(false);
    }
  };

  return { error, loading, updateUser };
};
