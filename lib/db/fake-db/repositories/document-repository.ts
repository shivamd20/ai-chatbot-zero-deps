import { Document } from '../../schema';
import { BaseRepository, generateRandomUUID } from './base-repository';
import type { ArtifactKind } from '@/components/artifact';

/**
 * Document repository interface that extends the base repository
 */
export interface DocumentRepository extends BaseRepository<Document> {
  findAllById(id: string): Document[];
  findLatestById(id: string): Document | null;
  deleteByIdAfterTimestamp(id: string, timestamp: Date): Document[];
}

/**
 * In-memory implementation of the document repository
 */
export class InMemoryDocumentRepository implements DocumentRepository {
  private documents: Document[] = [];

  findAll(): Document[] {
    return [...this.documents];
  }

  findById(id: string): Document | null {
    return this.documents.find(doc => doc.id === id) || null;
  }

  findAllById(id: string): Document[] {
    return this.documents
      .filter(doc => doc.id === id)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  findLatestById(id: string): Document | null {
    const documents = this.documents
      .filter(doc => doc.id === id)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    return documents.length > 0 ? documents[0] : null;
  }

  create(item: Partial<Document>): Document {
    const newDocument: Document = {
      id: item.id || generateRandomUUID(),
      title: item.title!,
      kind: item.kind as ArtifactKind || 'text',
      content: item.content || '',
      userId: item.userId!,
      createdAt: item.createdAt || new Date(),
    };
    this.documents.push(newDocument);
    return { ...newDocument };
  }

  update(id: string, item: Partial<Document>): Document | null {
    // Documents are versioned, so we don't update them directly
    // Instead, we create a new version
    const existingDoc = this.findLatestById(id);
    if (!existingDoc) return null;
    
    const newDocument: Document = {
      ...existingDoc,
      ...item,
      createdAt: new Date(),
    };
    
    this.documents.push(newDocument);
    return { ...newDocument };
  }

  delete(id: string): Document | null {
    // Documents are versioned, so we don't delete them directly
    // This method is not applicable for documents
    return null;
  }

  deleteByIdAfterTimestamp(id: string, timestamp: Date): Document[] {
    const documentsToDelete = this.documents.filter(doc => 
      doc.id === id && doc.createdAt > timestamp
    );
    
    this.documents = this.documents.filter(doc => 
      !(doc.id === id && doc.createdAt > timestamp)
    );
    
    return documentsToDelete;
  }
}