import "dotenv/config";
import express from "express";
import cors from "cors";
import { pool } from "./database.js";
import productController from "./controller.js";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "Store Inventory API is running",
    });
});

// REST routes
app.get("/products", productController.getAllProducts);
app.get("/products/:id", productController.getProductById);
app.post("/products", productController.addProduct);
app.patch("/products/:id/sell", productController.sellProduct);
app.put("/products/:id", productController.updateProduct);
app.delete("/products/:id", productController.deleteProduct);

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