import { MongoClient } from 'mongodb';
import { getConfig } from '../config';

/**
 * Create a new MongoDB client and connect to the database
 * @returns A new MongoDB client
 */
export async function createClient() {
    const config = getConfig();
    // this is just a placeholder implementation
    const client = new MongoClient(config.database.url);
    await client.connect();
    return client;
}