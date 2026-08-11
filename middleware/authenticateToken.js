// Import jsonwebtoken to verify access tokens
import jwt from "jsonwebtoken";

// Export the middleware function to authenticate tokens
export default function authenticateToken(req, res, next) {
    // Get the authorization header from the incoming request
    const authorizationHeader = req.headers.authorization;
    
    // Check if the header is missing or does not start with Bearer
    if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
        // Return error status for missing or badly formatted token
        return res.status(401).json({
            message: "Access token is required"
        });
    }
    
    // Split the header to extract only the token string
    const token = authorizationHeader.split(" ")[1];
    
    // Try block for the token verification process
    try {
        // Verify the token using the secret key
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        // Save the decoded user data into the request object
        req.user = decodedToken;
        // Move on to the next function or route
        next();
    // Catch any errors that happen during verification
    } catch (error) {
        // Return error status for invalid or expired tokens
        return res.status(401).json({
            message: "Invalid or expired access token"
        });
    }
}