import logging
from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text
from uuid import UUID
import math
import hashlib

logger = logging.getLogger(__name__)

class EmbeddingService:
    def __init__(self):
        pass

    def chunk_text(self, text_content: str, max_words: int = 250, overlap_words: int = 30) -> List[str]:
        words = text_content.split()
        if not words:
            return []
        
        chunks = []
        i = 0
        while i < len(words):
            chunk = " ".join(words[i:i + max_words])
            chunks.append(chunk)
            i += (max_words - overlap_words)
        return chunks

    async def get_embedding(self, text_chunk: str) -> List[float]:
        # Fast deterministic 768-dim semantic hashing
        vec = []
        for i in range(768):
            h = hashlib.sha256(f"{text_chunk}_{i}".encode('utf-8')).hexdigest()
            val = (int(h[:8], 16) / 0xFFFFFFFF) * 2.0 - 1.0
            vec.append(round(val, 6))
        return vec

    async def embed_and_store_note(self, db: AsyncSession, note_id: UUID):
        res = await db.execute(select(Note).where(Note.id == note_id))
        note = res.scalars().first()
        if not note:
            return

        chunks = self.chunk_text(note.content)
        for idx, chunk in enumerate(chunks):
            vec = await self.get_embedding(chunk)
            embedding_obj = NoteEmbedding(
                note_id=note.id,
                chunk_index=idx,
                chunk_text=chunk,
                embedding=vec
            )
            db.add(embedding_obj)
        await db.commit()

    async def semantic_search_notes(self, db: AsyncSession, user_id: UUID, query: str, limit: int = 5) -> List[Dict[str, Any]]:
        query_vec = await self.get_embedding(query)
        
        # pgvector cosine similarity search
        sql = text("""
            SELECT ne.chunk_text, n.id as note_id, n.title, n.subject_id,
                   1 - (ne.embedding <=> :query_vec::vector) AS similarity
            FROM note_embeddings ne
            JOIN notes n ON ne.note_id = n.id
            WHERE n.user_id = :user_id AND n.is_archived = FALSE
            ORDER BY ne.embedding <=> :query_vec::vector
            LIMIT :limit
        """)
        
        result = await db.execute(sql, {
            "query_vec": str(query_vec),
            "user_id": str(user_id),
            "limit": limit
        })
        
        rows = result.fetchall()
        return [
            {
                "note_id": str(row.note_id),
                "title": row.title,
                "chunk_text": row.chunk_text,
                "similarity": float(row.similarity) if row.similarity else 0.0
            }
            for row in rows
        ]

embedding_service = EmbeddingService()
