import bcrypt from "bcrypt"; // Securely hide passwords
import jwt from "jsonwebtoken"; // Create login tokens
import User from "../models/User.js"; // Connect to the database

const BCRYPT_ROUNDS = 12;

// Controller for the register function
export async function register(req, res) {
    // Try block for registration process
    try {
        // Extract name, email, and password from the request body
        const { name, email, password } = req.body;
        
        // Check if the name, email, password are missing
        if (!name || !email || !password) {
            // Return error status for missing fields
            return res.status(400).json({ message: "Name, email, and password are required" });
        }
        
        // Remove extra spaces from the name variable
        const normalizedName = name.trim();
        // Remove extra spaces and convert the email to lowercase
        const normalizedEmail = email.trim().toLowerCase();
        
        // Check if the password length is less than 8 characters
        if (password.length < 8) {
            // Return error if passwords is bellow 8 characters
            return res.status(400).json({ message: "Password must contain at least 8 characters" });
        }
        
        // Query the database to find a user by their email
        const existingUser = await User.findByEmail(normalizedEmail);
        // Check if email already exists
        if (existingUser) {
            // Return error status for taken emails
            return res.status(409).json({ message: "Email is already registered" });
        }
        
        // Hash the user password using bcrypt
        const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
        
        // Create a new user record in the database
        const user = await User.create({
            name: normalizedName,
            email: normalizedEmail,
            passwordHash
        });
        
        // Return success status with the created user data
        return res.status(201).json({
            message: "User registered successfully",
            user
        });
    // Catch any errors that happen during registration
    } catch (error) {
        // Log the error message to the console
        console.error("Register error:", error);
        // Check if the error code is for a duplicate entry
        if (error.code === "ER_DUP_ENTRY") {
            // Return error status for duplicate emails
            return res.status(409).json({ message: "Email is already registered" });
        }
        // Return error status for server failures
        return res.status(500).json({ message: "Unable to register user" });
    }
}

// Controller for the login function
export async function login(req, res) {
    // Try block for login process
    try {
        // Extract email and password from the request body
        const { email, password } = req.body;
        
        // Check if the email or password are missing
        if (!email || !password) {
            // Return error status for missing login fields
            return res.status(400).json({ message: "Email and password are required" });
        }
        
        // Remove extra spaces and convert the email to lowercase
        const normalizedEmail = email.trim().toLowerCase();
        // Query the database to find the user by their email
        const user = await User.findByEmail(normalizedEmail);
        
        // Check if the user not found in the database
        if (!user) {
            // Return error status for invalid credentials
            return res.status(401).json({ message: "Invalid email or password" });
        }
        
        // Compare the typed password with the hashed password
        const passwordMatches = await bcrypt.compare(password, user.password_hash);
        
        // Check if the passwords do not match
        if (!passwordMatches) {
            // Return error status for incorrect passwords
            return res.status(401).json({ message: "Invalid email or password" });
        }
        
        // Generate a json web token containing the user details
        const accessToken = jwt.sign(
            {
                userId: user.id,
                name: user.name,
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN || "1h"
            }
        );
        
        // Return success status with the access token
        return res.status(200).json({
            message: "Login successful",
            accessToken
        });
    // Catch any errors that happen during login
    } catch (error) {
        // Log the error message to the console
        console.error("Login error:", error);
        // Return error status for server failures
        return res.status(500).json({ message: "Unable to log in" });
    }
}