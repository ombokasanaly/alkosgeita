import { MongoClient } from "mongodb";
const uri=process.env.MONGODB_URI;
if(!uri) throw new Error("MONGODB_URI is required");
const g=globalThis as unknown as {mongo?:MongoClient};
export const mongo=g.mongo ?? new MongoClient(uri);
if(process.env.NODE_ENV!=="production") g.mongo=mongo;
export async function db(){await mongo.connect();return mongo.db(process.env.MONGODB_DB||"alkos");}