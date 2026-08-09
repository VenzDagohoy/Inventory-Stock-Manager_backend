import { pool } from "./database.js";
import { ProductModel } from "./model.js";

const productModel = new ProductModel(pool);

// --- PRODUCT REST CONTROLLERS ---

const getAllProducts = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { name } = req.query;
        const products = await productModel.getAll(userId, name);
        res.json({ products });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Database error", error: error.message });
    }
};

const getProductById = async (req, res) => {
    try {
        const userId = req.user.userId;
        const id = Number(req.params.id);
        const foundProduct = await productModel.getById(id, userId);
        
        if (!foundProduct) {
            return res.status(404).json({ message: "Product not found." });
        }
        res.json({ product: foundProduct });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Database error", error: error.message });
    }
};

const addProduct = async (req, res) => {
    try {
        const userId = req.user.userId;

        if (typeof req.body.name !== "string" || !req.body.name.trim()) {
            return res.status(400).json({ message: "Product name is required" });
        }
        const formattedName = req.body.name.toUpperCase().trim();

        let price = 0;
        if (req.body.price !== undefined) {
            price = Number(req.body.price);
            if (isNaN(price) || price < 0) {
                return res.status(400).json({ message: "Price must be a valid non-negative number" });
            }
        }

        let stock = 0;
        if (req.body.stock !== undefined) {
            stock = Number(req.body.stock);
            if (isNaN(stock) || stock < 0 || !Number.isInteger(stock)) {
                return res.status(400).json({ message: "Stock must be a valid non-negative integer" });
            }
        }

        const existingProduct = await productModel.getByName(userId, formattedName);
        if (existingProduct) {
            return res.status(400).json({ message: "Product already exists" });
        }

        const newProduct = await productModel.create(userId, formattedName, price, stock);
        res.status(201).json({
            message: "Product added successfully",
            product: newProduct
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Database error", error: error.message });
    }
};

const sellProduct = async (req, res) => {
    try {
        const userId = req.user.userId;
        const id = Number(req.params.id);
        const success = await productModel.sell(id, userId);
        
        if (!success) {
            return res.status(400).json({ 
                message: "Cannot sell: Item is out of stock or does not exist." 
            });
        }
        
        const updatedProduct = await productModel.getById(id, userId);
        res.json({
            message: "Item sold successfully!",
            product: updatedProduct
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Database error", error: error.message });
    }
};

const updateProduct = async (req, res) => {
    try {
        const userId = req.user.userId;
        const id = Number(req.params.id);
        const foundProduct = await productModel.getById(id, userId);
        
        if (!foundProduct) {
            return res.status(404).json({ message: "Product not found." });
        }

        const { name, price, stock } = req.body;
        let updatedName = foundProduct.name;
        let updatedPrice = foundProduct.price;
        let updatedStock = foundProduct.stock;

        if (name !== undefined) {
            if (typeof name !== "string" || !name.trim()) {
                return res.status(400).json({ message: "Name is required and must be a string" });
            }
            const formattedName = name.toUpperCase().trim();
            const duplicateCheck = await productModel.getByNameExcludingId(userId, formattedName, id);
            
            if (duplicateCheck) {
                return res.status(400).json({ message: "Product name already exists" });
            }
            updatedName = formattedName;
        }
        if (price !== undefined) {
            const parsedPrice = Number(price);
            if (isNaN(parsedPrice) || parsedPrice < 0) {
                return res.status(400).json({ message: "Price must be a valid non-negative number" });
            }
            updatedPrice = parsedPrice;
        }
        if (stock !== undefined) {
            const parsedStock = Number(stock);
            if (isNaN(parsedStock) || parsedStock < 0 || !Number.isInteger(parsedStock)) {
                return res.status(400).json({ message: "Stock must be a valid non-negative integer" });
            }
            updatedStock = parsedStock;
        }

        const updatedProduct = await productModel.update(id, userId, updatedName, updatedPrice, updatedStock);
        res.json({
            message: "Product updated successfully",
            product: updatedProduct
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Database error", error: error.message });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const userId = req.user.userId;
        const id = Number(req.params.id);
        const deleted = await productModel.delete(id, userId);
        
        if (!deleted) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.json({
            message: "Product deleted successfully"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Database error", error: error.message });
    }
};

// --- DAILY HISTORY CONTROLLERS ---

const resetDailyStats = async (req, res) => {
    try {
        const userId = req.user.userId;
        
        // 1. Get current totals
        const stats = await productModel.getOverallStats(userId);
        
        // Prevent creating an empty history entry if nothing was sold
        if (stats.total_sold == 0) {
            return res.status(400).json({ message: "Nothing to reset. No items sold yet." });
        }

        // 2. Save to history table
        await productModel.saveDailyHistory(userId, stats.total_sold, stats.total_earnings);
        
        // 3. Reset product sold counts to 0
        await productModel.resetSoldCounts(userId);

        res.json({ message: "Daily stats reset successfully and saved to history." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Database error", error: error.message });
    }
};

const getHistory = async (req, res) => {
    try {
        const userId = req.user.userId;
        const history = await productModel.getHistory(userId);
        res.json({ history });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Database error", error: error.message });
    }
};

export default {
    getAllProducts,
    getProductById,
    addProduct,
    sellProduct,
    updateProduct,
    deleteProduct,
    resetDailyStats,
    getHistory
};