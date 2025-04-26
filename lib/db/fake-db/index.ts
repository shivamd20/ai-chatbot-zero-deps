import { InMemoryUserRepository, type UserRepository } from './repositories/user-repository';
import { InMemoryChatRepository, type ChatRepository } from './repositories/chat-repository';
import { InMemoryMessageRepository, type MessageRepository } from './repositories/message-repository';
import { InMemoryVoteRepository, type VoteRepository } from './repositories/vote-repository';
import { InMemoryDocumentRepository, type DocumentRepository } from './repositories/document-repository';
import { InMemorySuggestionRepository, type SuggestionRepository } from './repositories/suggestion-repository';

/**
 * Repository manager that provides access to all repositories
 */
export class FakeDatabase {
  private static instance: FakeDatabase;

  private _userRepository: UserRepository;
  private _chatRepository: ChatRepository;
  private _messageRepository: MessageRepository;
  private _voteRepository: VoteRepository;
  private _documentRepository: DocumentRepository;
  private _suggestionRepository: SuggestionRepository;

  private constructor() {
    this._userRepository = new InMemoryUserRepository();
    this._chatRepository = new InMemoryChatRepository();
    this._messageRepository = new InMemoryMessageRepository();
    this._voteRepository = new InMemoryVoteRepository();
    this._documentRepository = new InMemoryDocumentRepository();
    this._suggestionRepository = new InMemorySuggestionRepository();
  }

  /**
   * Get the singleton instance of the FakeDatabase
   */
  public static getInstance(): FakeDatabase {
    if (!FakeDatabase.instance) {
      FakeDatabase.instance = new FakeDatabase();
    }
    return FakeDatabase.instance;
  }

  /**
   * Get the user repository
   */
  get users(): UserRepository {
    return this._userRepository;
  }

  /**
   * Get the chat repository
   */
  get chats(): ChatRepository {
    return this._chatRepository;
  }

  /**
   * Get the message repository
   */
  get messages(): MessageRepository {
    return this._messageRepository;
  }

  /**
   * Get the vote repository
   */
  get votes(): VoteRepository {
    return this._voteRepository;
  }

  /**
   * Get the document repository
   */
  get documents(): DocumentRepository {
    return this._documentRepository;
  }

  /**
   * Get the suggestion repository
   */
  get suggestions(): SuggestionRepository {
    return this._suggestionRepository;
  }
}

// Export a singleton instance of the FakeDatabase
export const fakeDb = FakeDatabase.getInstance();

// Export repository types for use in other files
export type { UserRepository, ChatRepository, MessageRepository, VoteRepository, DocumentRepository, SuggestionRepository };