const jwt = require('jsonwebtoken');

const {CIPHER_KEY} = process.env;

function JWTVerify(token) {
    return new Promise((resolve, reject) => {
        if (!token) {
            return reject(new AuthorizationError('NOT_FOUND_JWT'));
        }
        jwt.verify(token, CIPHER_KEY, function (error, decoded) {
            if (error) {
                serverLog(error.name, decoded);
                return reject(new AuthorizationError(error.name));
            }
            return resolve(decoded);
        });
    });
}

function JWTCreate(payload = {}, options = {}) {
    try {
        const accessTokenOptions = {
            algorithm: 'HS512',
            expiresIn: options.expiresIn || '1d'
        };
        const refreshTokenOptions = {
            algorithm: 'HS512',
            expiresIn: '30d'
        };
        const accessToken = jwt.sign({...payload, type: 'A'}, CIPHER_KEY, accessTokenOptions);
        const refreshToken = jwt.sign({...payload, type: 'R'}, CIPHER_KEY, refreshTokenOptions);
        return {accessToken, refreshToken};
    } catch (e) {
        throw e;
    }
}

module.exports = {
    JWTVerify,
    JWTCreate
};
