import { MongoClient } from 'mongodb';

const uri = 'mongodb+srv://galligamer999_db_user:tv6bqmz1fAJxisz1@cluster0.mhxeuxm.mongodb.net/?appName=Cluster0';

if (!uri) {
  throw new Error('Missing MONGODB_URI. Add it to a .env file in the project root.');
}

let clientPromise;

export function getMongoClient() {
  if (!clientPromise) {
    const client = new MongoClient(uri);
    clientPromise = client.connect();
  }

  return clientPromise;
}

export async function getProductsCollection() {
  const client = await getMongoClient();
  const dbName = process.env.MONGODB_DB || 'priceDrop';
  return client.db(dbName).collection('products');
}

export async function getUsersCollection() {
  const client = await getMongoClient();
  const dbName = process.env.MONGODB_DB || 'priceDrop';
  return client.db(dbName).collection('users');
}

export async function getOtpsCollection() {
  const client = await getMongoClient();
  const dbName = process.env.MONGODB_DB || 'priceDrop';
  return client.db(dbName).collection('otps');
}
