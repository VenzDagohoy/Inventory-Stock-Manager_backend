import { pool } from "./database.js";
import { ProductModel } from "./model.js";

const productModel = new ProductModel(pool);

const getAllProducts = async (req, res) => {
    try {
        const { name } = req.query;
        const products = await productModel.getAll(name);
        res.json({ products });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Database error", error: error.message });
    }
};

const getProductById = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const foundProduct = await productModel.getById(id);
        
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
        // Validate name
        if (typeof req.body.name !== "string" || !req.body.name.trim()) {
            return res.status(400).json({ message: "Product name is required" });
        }
        const formattedName = req.body.name.toUpperCase().trim();

        // Validate price, dont alaw negative
        let price = 0;
        if (req.body.price !== undefined) {
            price = Number(req.body.price);
            if (isNaN(price) || price < 0) {
                return res.status(400).json({ message: "Price must be a valid non-negative number" });
            }
        }

        // Validate stock, dont alaw negative
        let stock = 0;
        if (req.body.stock !== undefined) {
            stock = Number(req.body.stock);
            if (isNaN(stock) || stock < 0 || !Number.isInteger(stock)) {
                return res.status(400).json({ message: "Stock must be a valid non-negative integer" });
            }
        }

        // Check duplicate
        const existingProduct = await productModel.getByName(formattedName);
        if (existingProduct) {
            return res.status(400).json({ message: "Product already exists" });
        }

        const newProduct = await productModel.create(formattedName, price, stock);
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
        const id = Number(req.params.id);
        const success = await productModel.sell(id);
        
        if (!success) {
            return res.status(400).json({ 
                message: "Cannot sell: Item is out of stock or does not exist." 
            });
        }
        
        const updatedProduct = await productModel.getById(id);
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
        const id = Number(req.params.id);
        const foundProduct = await productModel.getById(id);
        
        if (!foundProduct) {
            return res.status(404).json({ message: "Product not found." });
        }

        const { name, price, stock } = req.body;
        let updatedName = foundProduct.name;
        let updatedPrice = foundProduct.price;
        let updatedStock = foundProduct.stock;

        // Validate and update name
        if (name !== undefined) {
            if (typeof name !== "string" || !name.trim()) {
                return res.status(400).json({ message: "Name is required and must be a string" });
            }
            const formattedName = name.toUpperCase().trim();
            const duplicateCheck = await productModel.getByNameExcludingId(formattedName, id);
            
            if (duplicateCheck) {
                return res.status(400).json({ message: "Product name already exists" });
            }
            updatedName = formattedName;
        }

        // Validate and update price
        if (price !== undefined) {
            const parsedPrice = Number(price);
            if (isNaN(parsedPrice) || parsedPrice < 0) {
                return res.status(400).json({ message: "Price must be a valid non-negative number" });
            }
            updatedPrice = parsedPrice;
        }

        // Validate and update stock
        if (stock !== undefined) {
            const parsedStock = Number(stock);
            if (isNaN(parsedStock) || parsedStock < 0 || !Number.isInteger(parsedStock)) {
                return res.status(400).json({ message: "Stock must be a valid non-negative integer" });
            }
            updatedStock = parsedStock;
        }

        const updatedProduct = await productModel.update(id, updatedName, updatedPrice, updatedStock);
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
        const id = Number(req.params.id);
        const deleted = await productModel.delete(id);
        
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

export default {
    getAllProducts,
    getProductById,
    addProduct,
    sellProduct,
    updateProduct,
    deleteProduct
};