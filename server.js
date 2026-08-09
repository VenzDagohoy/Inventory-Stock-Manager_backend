import "dotenv/config";
import express from "express";
import cors from "cors";
import { pool } from "./database.js";
import productController from "./controller.js";
import authRoutes from "./routes/authRoutes.js";
import authenticateToken from "./middleware/authenticateToken.js";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "Store Inventory API is running",
    });
});

// Authentication Routes
app.use("/auth", authRoutes);

// Protected REST routes (Users can only view and manage their own inventory items)
app.get("/products", authenticateToken, productController.getAllProducts);
app.get("/products/:id", authenticateToken, productController.getProductById);
app.post("/products", authenticateToken, productController.addProduct);
app.patch("/products/:id/sell", authenticateToken, productController.sellProduct);
app.put("/products/:id", authenticateToken, productController.updateProduct);
app.delete("/products/:id", authenticateToken, productController.deleteProduct);
app.post("/products/reset-daily", authenticateToken, productController.resetDailyStats);
app.get("/history", authenticateToken, productController.getHistory);

async function startServer() {
    try {
        const connection = await pool.getConnection();
        console.log("Connected to MySQL successfully");
        connection.release();
        
        app.listen(PORT, () => {
            console.log(`Server is running at http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Unable to connect to MySQL:", error.message);
        process.exit(1);
    }
}

startServer();