const jwt = require('jsonwebtoken');


// This is a middleware function for verifying JWT tokens and authenticating users. It ensures that the incoming HTTP request has a valid JWT before allowing access to protected routes.
const jwtAuthMiddleware = (req, res, next) => {
    const authorization = req.headers.authorization;
    if (!authorization) {
        return res.status(401).json({ error: 'Token not found' });
    }

    const token = authorization.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach user info
        next(); // Proceed to the next middleware/route
    } catch (err) {
        console.error(err);
        return res.status(401).json({ error: 'Invalid Token' });
    }
};


//function to generate jwt token 
const generateToken = (userData) => {
    //generate a new JWT token using user data 
    return jwt.sign(userData, process.env.JWT_SECRET/*,{expiresIn:'1h'} */);
    // return jwt.sign({data:userData}, process.env.JWT_SECRET,{expiresIn:'1h'} );
// made user data to be an object

}
module.exports = { jwtAuthMiddleware, generateToken }