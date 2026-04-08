const errorHandler = (error, req, res, next) => {
    if (error.name === 'CastError') {
            return res.status(400).json({ error: "malformed id" });
        }
    else if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: "invalid token" });
        }
        else if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ error: "token expired" });
            }
    else if (error.name === 'ValidationError') {
            return res.status(400).json({ error: error.message });
        }
    else if (error.name === 'MongoServerError' && error.code === 11000) {
            return res.status(400).json({ error: 'expected `username` to be unique' });
        }
    else{
        return res.status(500).json({error:"Internal Server Error"})
    }
}

export default errorHandler