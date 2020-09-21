const { expireCache } = require('../services/cache');

module.exports = async (req, res, next) => {
    await next();
    expireCache(req.user.id);
}