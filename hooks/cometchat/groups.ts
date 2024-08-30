import { CometChat } from "@cometchat/chat-sdk-react-native";
import { useEffect, useState } from "react";
import { useSendGroupMessage } from "./messages";

export const useCreateGroup = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<CometChat.CometChatException | null>(null);
  const [group, setGroup] = useState<CometChat.Group | null>(null);
  const { sendMessage } = useSendGroupMessage();

  const createGroup = async (group: CometChat.Group, members: string[]) => {
    setLoading(true);
    setError(null);
    setGroup(null);

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

  const createMultipleGroups = async (
    groupData: {
      members: string[];
      group: CometChat.Group;
      text: string;
    }[]
  ) => {
    setLoading(true);
    setError(null);
    setGroup(null);

    try {
      for (let { members, group, text } of groupData) {
        setError(null);
        setGroup(null);
        const groupMembers = members.map(
          (member) => new CometChat.GroupMember(member, CometChat.GROUP_MEMBER_SCOPE.PARTICIPANT)
        );
        try {
          await CometChat.createGroupWithMembers(group, groupMembers, []);
          const response = await CometChat.createGroup(group);
          const guid = response.getGuid();
          if (guid) {
            await CometChat.addMembersToGroup(guid, groupMembers, []);
            if (text.length > 0) sendMessage(guid, text);
          }
          // setGroup(response);
        } catch (error) {
          if ((error as CometChat.CometChatException).code === "ERR_GUID_ALREADY_EXISTS") {
            // setGroup(group);
            if (text.length > 0) sendMessage(group.getGuid(), text);
            continue;
          } else {
            if (text.length > 0) sendMessage(group.getGuid(), text);
            // setError(error as CometChat.CometChatException);
            continue;
          }
        } finally {
          setLoading(false);
        }
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  return { createGroup, loading, error, group, createMultipleGroups };
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
