import { storage } from "../../storage";

export const chatStorage = {
  // Conversations = Chat Threads
  getAllConversations: async () => {
    // This would need a userId, but for now we'll return empty
    // The audio routes should be updated to use req.user
    return [];
  },

  getConversation: async (id: number) => {
    return storage.getChatThread(id);
  },

  createConversation: async (title: string, userId?: number) => {
    if (!userId) throw new Error("User ID required");
    return storage.createChatThread(userId, title);
  },

  deleteConversation: async (id: number) => {
    return storage.deleteChatThread(id);
  },

  getMessagesByConversation: async (conversationId: number) => {
    return storage.getChatMessages(conversationId);
  },

  createMessage: async (conversationId: number, role: string, content: string) => {
    return storage.createChatMessage({
      threadId: conversationId,
      role,
      content,
    });
  },
};

export type IChatStorage = typeof chatStorage;
