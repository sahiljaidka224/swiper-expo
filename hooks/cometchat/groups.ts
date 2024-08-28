import { CometChat } from "@cometchat/chat-sdk-react-native";
import { useEffect, useState } from "react";

export const useCreateGroup = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<CometChat.CometChatException | null>(null);
  const [group, setGroup] = useState<CometChat.Group | null>(null);

  const createGroup = async (group: CometChat.Group, members: string[]) => {
    setLoading(true);
    setError(null);

    const groupMembers = members.map(
      (member) => new CometChat.GroupMember(member, CometChat.GROUP_MEMBER_SCOPE.PARTICIPANT)
    );

    try {
      const response = await CometChat.createGroup(group);
      if (response.getGuid()) {
        await CometChat.addMembersToGroup(response.getGuid(), groupMembers, []);
      }
      setGroup(response);
    } catch (error) {
      if ((error as CometChat.CometChatException).code === "ERR_GUID_ALREADY_EXISTS") {
        setGroup(group);
      } else {
        setError(error as CometChat.CometChatException);
      }
      console.log("Group creation failed with error:", error);
    } finally {
      setLoading(false);
    }
  };

  return { createGroup, loading, error, group };
};

export const useGetGroup = (guid: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<CometChat.CometChatException | null>(null);
  const [group, setGroup] = useState<CometChat.Group | null>(null);

  const getGroup = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await CometChat.getGroup(guid);
      setGroup(response);
    } catch (error) {
      setError(error as CometChat.CometChatException);
      console.log("Group fetch failed with error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getGroup();
  }, []);

  return { getGroup, isGroupLoading: loading, groupError: error, group };
};
