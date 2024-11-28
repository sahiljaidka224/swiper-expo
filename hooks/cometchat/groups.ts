import { CometChat } from "@cometchat/chat-sdk-react-native";
import { useEffect, useState } from "react";
import { useSendGroupMessage } from "./messages";
import { useAddCarToWatchlist } from "@/api/hooks/watchlist";
import { useAuth } from "@/context/AuthContext";

export const useCreateGroup = () => {
  const { token, user: currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<CometChat.CometChatException | null>(null);
  const [group, setGroup] = useState<CometChat.Group | null>(null);
  const { sendMessage } = useSendGroupMessage();
  const { trigger: addCarToWatchlist, isMutating, error: watchListError } = useAddCarToWatchlist();

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
            // TODO: Add car to watchlist
            // const metadata: { carId?: string } = group.getMetadata();
            // const carId = metadata?.carId;
            // console.log({ carId, members, token });
            // if (carId && members.length === 2 && token) {
            //   addCarToWatchlist({ carId, userId: members[1], token });
            // }
          }
        } catch (error) {
          if ((error as CometChat.CometChatException).code === "ERR_GUID_ALREADY_EXISTS") {
            if (text.length > 0) sendMessage(group.getGuid(), text);
            continue;
          } else {
            if (text.length > 0) sendMessage(group.getGuid(), text);
            continue;
          }
        } finally {
          setLoading(false);
          try {
            const user: CometChat.User = groupMembers.filter(
              (member) => member.getUid() !== currentUser?.id
            )[0];
            if (user && text.length > 0) {
              const customMsg = new CometChat.CustomMessage(user?.getUid(), "user", "custom", {
                text: "You have a car message",
              });
              CometChat.sendCustomMessage(customMsg);
            }
          } catch (error) {}
        }
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  return { createGroup, loading, error, group, createMultipleGroups, setGroupLoading: setLoading };
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

export const useLeaveGroup = () => {
  const [hasLeft, setHasLeft] = useState<boolean | null>(null);
  const [error, setError] = useState<CometChat.CometChatException | null>(null);

  const leaveGroup = (guid: string, scope: CometChat.GroupMemberScope) => {
    if (scope === CometChat.GROUP_MEMBER_SCOPE.PARTICIPANT) {
      leaveGroupAsParticipant(guid);
      return;
    }
    CometChat.deleteGroup(guid).then(
      (hasLeft: boolean) => {
        setHasLeft(hasLeft);
        console.log("Group left successfully:", hasLeft);
      },
      (error: CometChat.CometChatException) => {
        setError(error);
        console.log("Group leaving failed with exception:", error);
      }
    );
  };

  const leaveGroupAsParticipant = (guid: string) => {
    CometChat.leaveGroup(guid).then(
      (hasLeft: boolean) => {
        setHasLeft(hasLeft);
      },
      (error: CometChat.CometChatException) => {
        setError(error);
      }
    );
  };

  return { hasLeft, error, leaveGroup, leaveGroupAsParticipant };
};

export const useGetGroupMembers = (guid: string | null) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<CometChat.CometChatException | null>(null);
  const [groupMembers, setGroupMembers] = useState<CometChat.GroupMember[]>([]);

  const fetchGroupMembers = async () => {
    if (!guid) return;
    setLoading(true);
    setError(null);

    try {
      const groupMembersRequest = new CometChat.GroupMembersRequestBuilder(guid)
        .setLimit(10)
        .build();

      const members = await groupMembersRequest.fetchNext();
      setGroupMembers(members);
    } catch (error) {
      setError(error as CometChat.CometChatException);
      console.log("Group Member list fetching failed with exception:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupMembers();
  }, []);

  return { loading, error, groupMembers };
};

export const getGroupMembers = async (guid: string | null): Promise<CometChat.GroupMember[]> => {
  if (!guid) return [];

  try {
    const groupMembersRequest = new CometChat.GroupMembersRequestBuilder(guid).setLimit(10).build();

    const members = await groupMembersRequest.fetchNext();
    return members;
  } catch (error) {
    console.log("Group Member list fetching failed with exception:", error);
    throw error;
  }
};
