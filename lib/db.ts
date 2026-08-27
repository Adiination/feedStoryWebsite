import { MongoClient, type Collection, type Db, type ObjectId } from "mongodb";

/**
 * MongoDB connection.
 *
 * The client is cached on `globalThis` because dev hot-reload re-evaluates this
 * module on every change — without the cache you leak a connection pool per
 * edit and eventually exhaust the server's connection limit.
 */

const uri = process.env.MONGODB_URI ?? "";
const dbName = process.env.MONGODB_DB ?? "merivasna";

export const isDbConfigured = Boolean(uri);

type StoryDoc = {
  _id?: ObjectId;
  slug: string;
  lang: string;
  title: string;
  author: string;
  genre: string;
  tags: string[];
  /** YYYY-MM-DD */
  date: string;
  excerpt: string;
  /** Markdown source */
  body: string;
  featured: boolean;
  published: boolean;
  /** Slug of the same story in the other language, if any. */
  translationOf?: string;
  wordCount: number;
  readingMinutes: number;
  createdAt: Date;
  updatedAt: Date;
};

export type { StoryDoc };

const globalForMongo = globalThis as unknown as {
  _mongoClientPromise?: Promise<MongoClient>;
  _mongoIndexesReady?: Promise<void>;
};

function clientPromise(): Promise<MongoClient> {
  if (!uri) {
    throw new Error(
      "MONGODB_URI is not set. Add it to .env.local — see .env.example.",
    );
  }

  if (!globalForMongo._mongoClientPromise) {
    globalForMongo._mongoClientPromise = new MongoClient(uri, {
      // Fail fast rather than hanging a page render for 30s on a bad URI.
      serverSelectionTimeoutMS: 5000,
    }).connect();
  }

  return globalForMongo._mongoClientPromise;
}

export async function getDb(): Promise<Db> {
  const client = await clientPromise();
  return client.db(dbName);
}

/**
 * Unique index on (lang, slug) is what makes duplicate URLs impossible — the
 * admin form relies on the driver's duplicate-key error rather than a
 * check-then-write race.
 */
async function ensureIndexes(db: Db): Promise<void> {
  const stories = db.collection<StoryDoc>("stories");
  await Promise.all([
    stories.createIndex({ lang: 1, slug: 1 }, { unique: true }),
    stories.createIndex({ lang: 1, published: 1, date: -1 }),
    stories.createIndex({ lang: 1, published: 1, genre: 1, date: -1 }),
    stories.createIndex({ updatedAt: -1 }),
  ]);
}

export async function storiesCollection(): Promise<Collection<StoryDoc>> {
  const db = await getDb();

  // Runs once per process, not once per query.
  if (!globalForMongo._mongoIndexesReady) {
    globalForMongo._mongoIndexesReady = ensureIndexes(db).catch((error) => {
      // A read-only user can't create indexes; that shouldn't break reads.
      console.warn("[db] could not ensure indexes:", error?.message ?? error);
    });
  }
  await globalForMongo._mongoIndexesReady;

  return db.collection<StoryDoc>("stories");
}
