// Load environment variables from the env file
import "dotenv/config";
// Import the express framework
import express from "express";
// Import cors to allow external requests
import cors from "cors";
// Import the database connection pool
import { pool } from "./database.js";
// Import the product controller functions
import productController from "./controller.js";
// Import the authentication routes
import authRoutes from "./routes/authRoutes.js";
// Import the token authentication middleware
import authenticateToken from "./middleware/authenticateToken.js";

// Create a new express application
const app = express();
// Set the server port number
const PORT = Number(process.env.PORT) || 3000;

// Enable cors for all requests
app.use(cors());
// Allow the server to understand json data
app.use(express.json());

// Create a simple route to check if the server is running
app.get("/", (req, res) => {
    res.json({
        message: "Store Inventory API is running",
    });
});

// Set up the authentication routes
app.use("/auth", authRoutes);

// Protected product routes
app.get("/products", authenticateToken, productController.getAllProducts);
// Route to fetch product by id
app.get("/products/:id", authenticateToken, productController.getProductById);
// Route to add new product
app.post("/products", authenticateToken, productController.addProduct);
// Route to sell product
app.patch("/products/:id/sell", authenticateToken, productController.sellProduct);
// Route to update product
app.put("/products/:id", authenticateToken, productController.updateProduct);
// Route to delete product
app.delete("/products/:id", authenticateToken, productController.deleteProduct);
// Route to save daily stats and reset sold count
app.post("/products/reset-daily", authenticateToken, productController.resetDailyStats);
// Route to fetch sales history
app.get("/history", authenticateToken, productController.getHistory);

// Function to start the server
async function startServer() {
    // Try block for connecting to the database
    try {
        // Test the database connection
        const connection = await pool.getConnection();
        // Print success message to the console
        console.log("Connected to MySQL successfully");
        // Release the database connection
        connection.release();
        
        // Start the express server
        app.listen(PORT, () => {
            // Print the server url to the console
            console.log(`Server is running at http://localhost:${PORT}`);
        });
    // Catch any errors that happen
    } catch (error) {
        // Print the database connection error to the console
        console.error("Unable to connect to MySQL:", error.message);
        // Stop the server if the database fails
        process.exit(1);
    }
}

// Run the start server function
startServer();