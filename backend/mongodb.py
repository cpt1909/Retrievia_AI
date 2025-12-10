from bson import ObjectId

async def insert_chunks(filename, collection, chunks):
    res = collection.insert_one({
            "filename": filename,
            "chunks": chunks,
        })

    return str(res.inserted_id)

async def fetch_chunks(collection, uid: str):
    res = collection.find(
        {
            "_id": ObjectId(uid)
        }, {
            "chunks": 1
        }
    )
    return res[0]["chunks"]