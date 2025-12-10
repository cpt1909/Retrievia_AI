from dotenv import load_dotenv
load_dotenv()

from typing import List

from qdrant_client.models import VectorParams, Distance
from qdrant_client.models import PointStruct

async def insert_document(client, document_id, embeddings, dimension = 3072) -> bool:
    try:
        if not client.collection_exists(document_id):
           client.create_collection(
              collection_name = document_id,
              vectors_config = VectorParams(
                  size = dimension,
                  distance = Distance.COSINE
              ),
           )

        client.upsert(
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
    except:
        return False

async def fetch_vector_index(client, query_vector: List[float], uid: str) -> List[int]:
    hits = client.query_points(
        collection_name=uid,
        query=query_vector,
        limit=5,
    )
    return [i.id for i in hits.points]