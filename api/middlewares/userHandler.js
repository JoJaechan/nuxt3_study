const cipher = require('@utils/cipher');

const allowedRoutes = [];

async function handler(req, res, next) {
    const { _parsedUrl } = req;
    const path = _parsedUrl.pathname;

    if (allowedRoutes.some((item) => item.method === req.method && item.path === path)) {
        return next();
    }

    try {
        const { ACCESS_TOKEN: accessToken } = req.cookies;
        if (!accessToken) {
            req._user = {};
            return next();
        }

        req._user = await cipher.JWTVerify(accessToken);

        return next();
    } catch (e) {
        return next(e);
    }
}

module.exports = handler;
