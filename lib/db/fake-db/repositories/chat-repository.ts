import { Chat } from '../../schema';
import { BaseRepository, generateRandomUUID } from './base-repository';

/**
 * Chat repository interface that extends the base repository
 */
export interface ChatRepository extends BaseRepository<Chat> {
  findByUserId(userId: string, limit: number, startingAfter: string | null, endingBefore: string | null): { chats: Chat[], hasMore: boolean };
  updateVisibility(id: string, visibility: 'private' | 'public'): Chat | null;
}

/**
 * In-memory implementation of the chat repository
 */
export class InMemoryChatRepository implements ChatRepository {
  private chats: Chat[] = [];

  findAll(): Chat[] {
    return [...this.chats];
  }

  findById(id: string): Chat | null {
    return this.chats.find(chat => chat.id === id) || null;
  }

  findByUserId(userId: string, limit: number, startingAfter: string | null, endingBefore: string | null): { chats: Chat[], hasMore: boolean } {
    const extendedLimit = limit + 1;
    
    // Filter chats by user ID
    let filteredChats = this.chats.filter(c => c.userId === userId);
    
    // Sort by createdAt in descending order
    filteredChats.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    if (startingAfter) {
      const selectedChat = this.chats.find(c => c.id === startingAfter);
      if (!selectedChat) {
        throw new Error(`Chat with id ${startingAfter} not found`);
      }
      
      filteredChats = filteredChats.filter(c => 
        c.createdAt.getTime() > selectedChat.createdAt.getTime()
      );
    } else if (endingBefore) {
      const selectedChat = this.chats.find(c => c.id === endingBefore);
      if (!selectedChat) {
        throw new Error(`Chat with id ${endingBefore} not found`);
      }
      
      filteredChats = filteredChats.filter(c => 
        c.createdAt.getTime() < selectedChat.createdAt.getTime()
      );
    }
    
    // Apply limit
    const hasMore = filteredChats.length > limit;
    
    return {
      chats: hasMore ? filteredChats.slice(0, limit) : filteredChats,
      hasMore,
    };
  }

  create(item: Partial<Chat>): Chat {
    const newChat: Chat = {
      id: item.id || generateRandomUUID(),
      createdAt: item.createdAt || new Date(),
      title: item.title!,
      userId: item.userId!,
      visibility: item.visibility || 'private',
    };
    this.chats.push(newChat);
    return { ...newChat };
  }

  update(id: string, item: Partial<Chat>): Chat | null {
    const index = this.chats.findIndex(chat => chat.id === id);
    if (index === -1) return null;
    
    this.chats[index] = { ...this.chats[index], ...item };
    return { ...this.chats[index] };
  }

  updateVisibility(id: string, visibility: 'private' | 'public'): Chat | null {
    return this.update(id, { visibility });
  }

  delete(id: string): Chat | null {
    const index = this.chats.findIndex(chat => chat.id === id);
    if (index === -1) return null;
    
    const deletedChat = this.chats[index];
    this.chats.splice(index, 1);
    return { ...deletedChat };
  }
}