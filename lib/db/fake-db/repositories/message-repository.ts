import { DBMessage } from '../../schema';
import { BaseRepository, generateRandomUUID } from './base-repository';

/**
 * Message repository interface that extends the base repository
 */
export interface MessageRepository extends BaseRepository<DBMessage> {
  findByChatId(chatId: string): DBMessage[];
  deleteByChatIdAfterTimestamp(chatId: string, timestamp: Date): DBMessage[];
  countByUserIdAndTimeRange(userId: string, startTime: Date): number;
  saveMany(messages: Array<DBMessage>): DBMessage[];
}

/**
 * In-memory implementation of the message repository
 */
export class InMemoryMessageRepository implements MessageRepository {
  private messages: DBMessage[] = [];

  findAll(): DBMessage[] {
    return [...this.messages];
  }

  findById(id: string): DBMessage | null {
    return this.messages.find(message => message.id === id) || null;
  }

  findByChatId(chatId: string): DBMessage[] {
    return this.messages
      .filter(m => m.chatId === chatId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  create(item: Partial<DBMessage>): DBMessage {
    const newMessage: DBMessage = {
      id: item.id || generateRandomUUID(),
      chatId: item.chatId!,
      role: item.role!,
      parts: item.parts!,
      attachments: item.attachments!,
      createdAt: item.createdAt || new Date(),
    };
    this.messages.push(newMessage);
    return { ...newMessage };
  }

  saveMany(messages: Array<DBMessage>): DBMessage[] {
    const newMessages = messages.map(message => ({
      ...message,
      id: message.id || generateRandomUUID()
    }));
    
    this.messages.push(...newMessages);
    return [...newMessages];
  }

  update(id: string, item: Partial<DBMessage>): DBMessage | null {
    const index = this.messages.findIndex(message => message.id === id);
    if (index === -1) return null;
    
    this.messages[index] = { ...this.messages[index], ...item };
    return { ...this.messages[index] };
  }

  delete(id: string): DBMessage | null {
    const index = this.messages.findIndex(message => message.id === id);
    if (index === -1) return null;
    
    const deletedMessage = this.messages[index];
    this.messages.splice(index, 1);
    return { ...deletedMessage };
  }

  deleteByChatIdAfterTimestamp(chatId: string, timestamp: Date): DBMessage[] {
    const messagesToDelete = this.messages
      .filter(m => m.chatId === chatId && m.createdAt >= timestamp);
    
    if (messagesToDelete.length > 0) {
      const messageIds = messagesToDelete.map(m => m.id);
      
      // Remove messages from the array
      this.messages = this.messages.filter(m => 
        !(m.chatId === chatId && messageIds.includes(m.id))
      );
    }
    
    return messagesToDelete;
  }

  countByUserIdAndTimeRange(userId: string, startTime: Date): number {
    // This method requires chat information, which we don't have in this repository
    // We'll implement this in the fake-queries.ts file using both repositories
    return 0;
  }
}