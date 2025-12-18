from typing import List

from qdrant_client.models import VectorParams, Distance, PointStruct

async def insert_document(client, document_id, embeddings, dimension = 3072) -> bool:
    try:
        exists = await client.collection_exists(document_id)
        if not exists:
           await client.create_collection(
              collection_name = document_id,
              vectors_config = VectorParams(
                  size = dimension,
                  distance = Distance.COSINE
              ),
           )

        await client.upsert(
            collection_name = document_id,
            points = [
                PointStruct(
                    id = idx,
                    vector = embedding,
                )
                for idx, embedding in enumerate(embeddings)
            ],
        )
        return True
    except Exception as e:
        print(e)
        return False

async def fetch_vector_index(client, query_vector: List[float], uid: str) -> List[int]:
    hits = await client.query_points(
        collection_name=uid,
        query=query_vector,
        limit=5,
    )
    return [i.id for i in hits.points]