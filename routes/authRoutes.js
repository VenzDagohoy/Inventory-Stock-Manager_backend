// Import the express framework
import express from "express";
// Import the register and login functions from the controller
import { register, login } from "../controllers/authController.js";

// Create new router object
const router = express.Router();

// Route to handle user registration
router.post("/register", register);
// Route to handle user login
router.post("/login", login);

// Export the router for use in the main server file
export default router;