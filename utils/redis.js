const redis = require('redis');
const { promisify } = require('util');

class RedisClient {
    constructor() {
        this.client = redis.createClient();
        this.getAsync = promisify(this.client.get).bind(this.client);
        this.client.on('error', function (err) {
            console.error('Redis client not connected to the server: ' + err.message);
        });
        this.client.on('connect', function () {
            console.log(' connected');
        });
    }


    isAlive() {
        return this.client.connected;
    }


    async get(key) {
        const value = await this.getAsync(key);
        return value;
    }


    async set(key, value, duration) {
        this.client.setex(key, duration, value);
    }


    async del(key) {
        this.client.del(key);
    }
}

const redisClient = new RedisClient();
module.exports = redisClient;
