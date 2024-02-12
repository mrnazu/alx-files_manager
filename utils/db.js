const { MongoClient } = require('mongodb');

class DBClient {
  constructor() {
    const uri = 'mongodb://localhost:27017/?directConnection=true';

    this.client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    this.client.connect();
    this.db = this.client.db();
  }

  async isAlive() {
    try {
      await this.client.connect();
      console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
  }

  async nbUsers() {
    try {
      const usersCollection = this.db.collection('users');
      const count = await usersCollection.countDocuments();
      return count;
    } catch (error) {
      throw new Error(`Error counting users: ${error}`);
    }
  }

  async nbFiles() {
    try {
      const filesCollection = this.db.collection('files');
      const count = await filesCollection.countDocuments();
      return count;
    } catch (error) {
      throw new Error(`Error counting files: ${error}`);
    }
  }
}

const dbClient = new DBClient();
module.exports = dbClient;
