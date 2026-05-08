import { MongoClient, type Db } from "mongodb";

declare global {
  var _sunbedMongoClientPromise: Promise<MongoClient> | undefined;
}

const defaultDatabaseName = "sunbed_app";

export async function getDb(): Promise<Db> {
  const client = await getMongoClient();
  return client.db(process.env.MONGODB_DB ?? defaultDatabaseName);
}

async function getMongoClient() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI must be set in .env.");
  }

  if (!globalThis._sunbedMongoClientPromise) {
    const client = new MongoClient(uri);
    globalThis._sunbedMongoClientPromise = client.connect();
  }

  return globalThis._sunbedMongoClientPromise;
}
