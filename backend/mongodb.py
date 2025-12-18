from bson import ObjectId

async def insert_chunks(filename, collection, chunks):
    res = await collection.insert_one({
            "filename": filename,
            "chunks": chunks,
        })

    return str(res.inserted_id)

async def fetch_chunks(collection, uid: str):
    res = await collection.find_one(
        { "_id": ObjectId(uid) },
        { "chunks": 1 },
    )
    if not res:
        return []
    return res["chunks"]