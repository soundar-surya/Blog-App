const mongoose = require('mongoose');
const exec = mongoose.Query.prototype.exec;

const redis = require('redis');
const redisUrl = "redis://127.0.0.1:6379"
const client = redis.createClient(redisUrl);
const util = require('util');
client.hget = util.promisify(client.hget);


//creating custom method for caching
mongoose.Query.prototype.cache = function(options = {}){
    this._cache = true;
    this._hashKey = JSON.stringify(options.key || '');
    return this;
}

mongoose.Query.prototype.exec = async function() {

        //A ref for cache
        if(!this._cache) return exec.apply(this, arguments);

        //generating a unique key
        const key = JSON.stringify(Object.assign( {}, this.getQuery(), { collection: this.mongooseCollection.name} ));

        //check whether it is exist in a redis
        const cachedData = await client.hget(this._hashKey, key);

        //if we do, return that
        if(cachedData){
            const doc = JSON.parse(cachedData);

            console.log('SERVING FROM CACHE');
            return Array.isArray(doc)
            ? doc.map(item => new this.model(item))
            : new this.model(doc);
        }

        //else, store it in mongodb, and store the result in redis
        const result = await exec.apply(this, arguments);
        client.hset(this._hashKey, key, JSON.stringify(result));
        return result;
}; 

module.exports = {
    expireCache(_hashKey){
        client.del(JSON.stringify(_hashKey));
    }
};


