import { Suggestion } from '../../schema';
import { BaseRepository, generateRandomUUID } from './base-repository';

/**
 * Suggestion repository interface that extends the base repository
 */
export interface SuggestionRepository extends BaseRepository<Suggestion> {
  findByDocumentId(documentId: string): Suggestion[];
  deleteByDocumentIdAfterTimestamp(documentId: string, timestamp: Date): Suggestion[];
  saveMany(suggestions: Array<Suggestion>): Suggestion[];
}

/**
 * In-memory implementation of the suggestion repository
 */
export class InMemorySuggestionRepository implements SuggestionRepository {
  private suggestions: Suggestion[] = [];

  findAll(): Suggestion[] {
    return [...this.suggestions];
  }

  findById(id: string): Suggestion | null {
    return this.suggestions.find(suggestion => suggestion.id === id) || null;
  }

  findByDocumentId(documentId: string): Suggestion[] {
    return this.suggestions.filter(suggestion => suggestion.documentId === documentId);
  }

  create(item: Partial<Suggestion>): Suggestion {
    const newSuggestion: Suggestion = {
      id: item.id || generateRandomUUID(),
      documentId: item.documentId!,
      documentCreatedAt: item.documentCreatedAt!,
      originalText: item.originalText!,
      suggestedText: item.suggestedText!,
      description: item.description || null,
      isResolved: item.isResolved || false,
      userId: item.userId!,
      createdAt: item.createdAt || new Date(),
    };
    this.suggestions.push(newSuggestion);
    return { ...newSuggestion };
  }

  saveMany(suggestions: Array<Suggestion>): Suggestion[] {
    const newSuggestions = suggestions.map(suggestion => ({
      ...suggestion,
      id: suggestion.id || generateRandomUUID()
    }));
    
    this.suggestions.push(...newSuggestions);
    return [...newSuggestions];
  }

  update(id: string, item: Partial<Suggestion>): Suggestion | null {
    const index = this.suggestions.findIndex(suggestion => suggestion.id === id);
    if (index === -1) return null;
    
    this.suggestions[index] = { ...this.suggestions[index], ...item };
    return { ...this.suggestions[index] };
  }

  delete(id: string): Suggestion | null {
    const index = this.suggestions.findIndex(suggestion => suggestion.id === id);
    if (index === -1) return null;
    
    const deletedSuggestion = this.suggestions[index];
    this.suggestions.splice(index, 1);
    return { ...deletedSuggestion };
  }

  deleteByDocumentIdAfterTimestamp(documentId: string, timestamp: Date): Suggestion[] {
    const suggestionsToDelete = this.suggestions.filter(suggestion => 
      suggestion.documentId === documentId && suggestion.documentCreatedAt > timestamp
    );
    
    this.suggestions = this.suggestions.filter(suggestion => 
      !(suggestion.documentId === documentId && suggestion.documentCreatedAt > timestamp)
    );
    
    return suggestionsToDelete;
  }
}