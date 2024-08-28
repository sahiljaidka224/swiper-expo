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
