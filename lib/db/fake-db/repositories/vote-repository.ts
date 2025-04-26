import { Vote } from '../../schema';
import { BaseRepository } from './base-repository';

/**
 * Vote repository interface that extends the base repository
 */
export interface VoteRepository extends BaseRepository<Vote> {
  findByChatId(chatId: string): Vote[];
  findByMessageId(messageId: string): Vote | null;
  findByChatIdAndMessageId(chatId: string, messageId: string): Vote | null;
  deleteByChatIdAndMessageIds(chatId: string, messageIds: string[]): Vote[];
}

/**
 * In-memory implementation of the vote repository
 */
export class InMemoryVoteRepository implements VoteRepository {
  private votes: Vote[] = [];

  findAll(): Vote[] {
    return [...this.votes];
  }

  findById(id: string): Vote | null {
    // Votes don't have an id field, they use composite key of chatId and messageId
    return null;
  }

  findByChatId(chatId: string): Vote[] {
    return this.votes.filter(vote => vote.chatId === chatId);
  }

  findByMessageId(messageId: string): Vote | null {
    return this.votes.find(vote => vote.messageId === messageId) || null;
  }

  findByChatIdAndMessageId(chatId: string, messageId: string): Vote | null {
    return this.votes.find(vote => 
      vote.chatId === chatId && vote.messageId === messageId
    ) || null;
  }

  create(item: Partial<Vote>): Vote {
    const newVote: Vote = {
      chatId: item.chatId!,
      messageId: item.messageId!,
      isUpvoted: item.isUpvoted!,
    };
    
    // Check if vote already exists
    const existingIndex = this.votes.findIndex(v => 
      v.chatId === newVote.chatId && v.messageId === newVote.messageId
    );
    
    if (existingIndex !== -1) {
      // Update existing vote
      this.votes[existingIndex] = newVote;
    } else {
      // Add new vote
      this.votes.push(newVote);
    }
    
    return { ...newVote };
  }

  update(id: string, item: Partial<Vote>): Vote | null {
    // Votes don't have an id field, they use composite key of chatId and messageId
    // This method is not applicable for votes
    return null;
  }

  updateByChatIdAndMessageId(chatId: string, messageId: string, isUpvoted: boolean): Vote | null {
    const index = this.votes.findIndex(vote => 
      vote.chatId === chatId && vote.messageId === messageId
    );
    
    if (index === -1) return null;
    
    this.votes[index] = { ...this.votes[index], isUpvoted };
    return { ...this.votes[index] };
  }

  delete(id: string): Vote | null {
    // Votes don't have an id field, they use composite key of chatId and messageId
    // This method is not applicable for votes
    return null;
  }

  deleteByChatIdAndMessageId(chatId: string, messageId: string): Vote | null {
    const index = this.votes.findIndex(vote => 
      vote.chatId === chatId && vote.messageId === messageId
    );
    
    if (index === -1) return null;
    
    const deletedVote = this.votes[index];
    this.votes.splice(index, 1);
    return { ...deletedVote };
  }

  deleteByChatIdAndMessageIds(chatId: string, messageIds: string[]): Vote[] {
    const votesToDelete = this.votes.filter(vote => 
      vote.chatId === chatId && messageIds.includes(vote.messageId)
    );
    
    this.votes = this.votes.filter(vote => 
      !(vote.chatId === chatId && messageIds.includes(vote.messageId))
    );
    
    return votesToDelete;
  }
}