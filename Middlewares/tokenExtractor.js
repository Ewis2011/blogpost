import jwt from "jsonwebtoken"

const tokenExtractor = (req, res, next) => {
    const authorization = req.headers.authorization;
    if(authorization && authorization.startsWith("Bearer")){
       req.token = authorization.replace('Bearer ','');
    }
    else{
        req.token = null;
    }
    next();
};

const userExtractor = (req, res, next) => {
    try{
        const decodeToken = jwt.verify(req.token, process.env.SECRET);
        if(!decodeToken){
            return res.status(401).json({error: "missing or invalid token"})
        }
    
        req.user = decodeToken;
        next();
        
    } catch (error){
        next(error);
    }
};
export  {tokenExtractor, userExtractor};