import 'server-only';

import {
  and,
  asc,
  count,
  desc,
  eq,
  gt,
  gte,
  inArray,
  lt,
  type SQL,
} from 'drizzle-orm';

import {
  user,
  chat,
  type User,
  document,
  type Suggestion,
  suggestion,
  message,
  vote,
  type DBMessage,
  type Chat,
  type Document,
  type Vote,
} from './schema';
import type { ArtifactKind } from '@/components/artifact';
import { generateUUID } from '../utils';
import { generateHashedPassword } from './utils';
import { fakeDb } from './fake-db';

// User functions
export async function getUser(email: string): Promise<Array<User>> {
  try {
    return fakeDb.users.findByEmail(email);
  } catch (error) {
    console.error('Failed to get user from database');
    throw error;
  }
}

export async function createUser(email: string, password: string) {
  const hashedPassword = generateHashedPassword(password);

  try {
    const newUser = fakeDb.users.create({
      email,
      password: hashedPassword
    });
    return newUser;
  } catch (error) {
    console.error('Failed to create user in database');
    throw error;
  }
}

export async function createGuestUser() {
  try {
    const newUser = fakeDb.users.createGuestUser();
    return [{
      id: newUser.id,
      email: newUser.email,
    }];
  } catch (error) {
    console.error('Failed to create guest user in database');
    throw error;
  }
}

// Chat functions
export async function saveChat({
  id,
  userId,
  title,
}: {
  id: string;
  userId: string;
  title: string;
}) {
  try {
    return fakeDb.chats.create({
      id,
      userId,
      title,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error('Failed to save chat in database');
    throw error;
  }
}

export async function deleteChatById({ id }: { id: string }) {
  try {
    // Delete related votes
    const messageIds = fakeDb.messages.findByChatId(id).map(m => m.id);
    if (messageIds.length > 0) {
      fakeDb.votes.deleteByChatIdAndMessageIds(id, messageIds);
    }
    
    // Delete related messages
    fakeDb.messages.findByChatId(id).forEach(m => {
      fakeDb.messages.delete(m.id);
    });
    
    // Delete and return the chat
    return fakeDb.chats.delete(id);
  } catch (error) {
    console.error('Failed to delete chat by id from database');
    throw error;
  }
}

export async function getChatsByUserId({
  id,
  limit,
  startingAfter,
  endingBefore,
}: {
  id: string;
  limit: number;
  startingAfter: string | null;
  endingBefore: string | null;
}) {
  try {
    return fakeDb.chats.findByUserId(id, limit, startingAfter, endingBefore);
  } catch (error) {
    console.error('Failed to get chats by user from database');
    throw error;
  }
}

export async function getChatById({ id }: { id: string }) {
  try {
    return fakeDb.chats.findById(id);
  } catch (error) {
    console.error('Failed to get chat by id from database');
    throw error;
  }
}

// Message functions
export async function saveMessages({
  messages,
}: {
  messages: Array<DBMessage>;
}) {
  try {
    return fakeDb.messages.saveMany(messages);
  } catch (error) {
    console.error('Failed to save messages in database', error);
    throw error;
  }
}

export async function getMessagesByChatId({ id }: { id: string }) {
  try {
    return fakeDb.messages.findByChatId(id);
  } catch (error) {
    console.error('Failed to get messages by chat id from database', error);
    throw error;
  }
}

export async function getMessageById({ id }: { id: string }) {
  try {
    const message = fakeDb.messages.findById(id);
    return message ? [message] : [];
  } catch (error) {
    console.error('Failed to get message by id from database');
    throw error;
  }
}

export async function deleteMessagesByChatIdAfterTimestamp({
  chatId,
  timestamp,
}: {
  chatId: string;
  timestamp: Date;
}) {
  try {
    const messagesToDelete = fakeDb.messages.deleteByChatIdAfterTimestamp(chatId, timestamp);
    
    if (messagesToDelete.length > 0) {
      const messageIds = messagesToDelete.map(m => m.id);
      fakeDb.votes.deleteByChatIdAndMessageIds(chatId, messageIds);
    }
    
    return messagesToDelete;
  } catch (error) {
    console.error(
      'Failed to delete messages by id after timestamp from database',
    );
    throw error;
  }
}

// Vote functions
export async function voteMessage({
  chatId,
  messageId,
  type,
}: {
  chatId: string;
  messageId: string;
  type: 'up' | 'down';
}) {
  try {
    return fakeDb.votes.create({
      chatId,
      messageId,
      isUpvoted: type === 'up',
    });
  } catch (error) {
    console.error('Failed to upvote message in database', error);
    throw error;
  }
}

export async function getVotesByChatId({ id }: { id: string }) {
  try {
    return fakeDb.votes.findByChatId(id);
  } catch (error) {
    console.error('Failed to get votes by chat id from database', error);
    throw error;
  }
}

// Document functions
export async function saveDocument({
  id,
  title,
  kind,
  content,
  userId,
}: {
  id: string;
  title: string;
  kind: ArtifactKind;
  content: string;
  userId: string;
}) {
  try {
    const newDocument = fakeDb.documents.create({
      id,
      title,
      kind,
      content,
      userId,
      createdAt: new Date(),
    });
    
    return [newDocument];
  } catch (error) {
    console.error('Failed to save document in database');
    throw error;
  }
}

export async function getDocumentsById({ id }: { id: string }) {
  try {
    return fakeDb.documents.findAllById(id);
  } catch (error) {
    console.error('Failed to get document by id from database');
    throw error;
  }
}

export async function getDocumentById({ id }: { id: string }) {
  try {
    return fakeDb.documents.findLatestById(id);
  } catch (error) {
    console.error('Failed to get document by id from database');
    throw error;
  }
}

export async function deleteDocumentsByIdAfterTimestamp({
  id,
  timestamp,
}: {
  id: string;
  timestamp: Date;
}) {
  try {
    // Delete related suggestions
    fakeDb.suggestions.deleteByDocumentIdAfterTimestamp(id, timestamp);
    
    // Delete documents and return them
    return fakeDb.documents.deleteByIdAfterTimestamp(id, timestamp);
  } catch (error) {
    console.error(
      'Failed to delete documents by id after timestamp from database',
    );
    throw error;
  }
}

// Suggestion functions
export async function saveSuggestions({
  suggestions,
}: {
  suggestions: Array<Suggestion>;
}) {
  try {
    return fakeDb.suggestions.saveMany(suggestions);
  } catch (error) {
    console.error('Failed to save suggestions in database');
    throw error;
  }
}

export async function getSuggestionsByDocumentId({
  documentId,
}: {
  documentId: string;
}) {
  try {
    return fakeDb.suggestions.findByDocumentId(documentId);
  } catch (error) {
    console.error(
      'Failed to get suggestions by document version from database',
    );
    throw error;
  }
}

export async function updateChatVisiblityById({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: 'private' | 'public';
}) {
  try {
    return fakeDb.chats.updateVisibility(chatId, visibility);
  } catch (error) {
    console.error('Failed to update chat visibility in database');
    throw error;
  }
}

export async function getMessageCountByUserId({
  id,
  differenceInHours,
}: { id: string; differenceInHours: number }) {
  try {
    const twentyFourHoursAgo = new Date(
      Date.now() - differenceInHours * 60 * 60 * 1000,
    );
    
    // Get all chats for this user
    const userChats = fakeDb.chats.findAll().filter(c => c.userId === id);
    const userChatIds = userChats.map(c => c.id);
    
    // Count messages from this user in the last X hours
    const messageCount = fakeDb.messages.findAll().filter(m => 
      userChatIds.includes(m.chatId) && 
      m.createdAt >= twentyFourHoursAgo &&
      m.role === 'user'
    ).length;
    
    return messageCount;
  } catch (error) {
    console.error(
      'Failed to get message count by user id for the last 24 hours from database',
    );
    throw error;
  }
}