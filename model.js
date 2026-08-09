export class ProductModel {
    constructor(pool) {
        this.pool = pool;
    }

    // --- PRODUCT CRUD OPERATIONS ---

    // Get all products belonging to a specific user, with optional name filtering
    async getAll(userId, name) {
        if (name) {
            const [rows] = await this.pool.execute(
                "SELECT * FROM products WHERE user_id = ? AND name LIKE ?",
                [userId, `%${name.toUpperCase().trim()}%`]
            );
            return rows;
        }
        const [rows] = await this.pool.execute(
            "SELECT * FROM products WHERE user_id = ? ORDER BY id ASC",
            [userId]
        );
        return rows;
    }

    // Get a single product by ID scoped to a user
    async getById(id, userId) {
        const [rows] = await this.pool.execute(
            "SELECT * FROM products WHERE id = ? AND user_id = ?",
            [id, userId]
        );
        return rows[0];
    }

    // Check if a product exists by name for a specific user
    async getByName(userId, name) {
        const [rows] = await this.pool.execute(
            "SELECT * FROM products WHERE user_id = ? AND name = ?",
            [userId, name]
        );
        return rows[0];
    }

    // Check if a name is taken by another ID for a specific user (for PUT updates)
    async getByNameExcludingId(userId, name, id) {
        const [rows] = await this.pool.execute(
            "SELECT * FROM products WHERE user_id = ? AND name = ? AND id != ?",
            [userId, name, id]
        );
        return rows[0];
    }

    // Insert a new product tied to the user
    async create(userId, name, price, stock) {
        const [result] = await this.pool.execute(
            "INSERT INTO products (user_id, name, price, stock) VALUES (?, ?, ?, ?)",
            [userId, name, price, stock]
        );
        return this.getById(result.insertId, userId);
    }

    // Quick action: Sell 1 item scoped to a user (decrements stock, increments sold count)
    async sell(id, userId) {
        const [result] = await this.pool.execute(
            "UPDATE products SET stock = stock - 1, sold = sold + 1 WHERE id = ? AND user_id = ? AND stock > 0",
            [id, userId]
        );
        return result.affectedRows > 0;
    }

    // Update an existing product scoped to a user
    async update(id, userId, name, price, stock) {
        await this.pool.execute(
            "UPDATE products SET name = ?, price = ?, stock = ? WHERE id = ? AND user_id = ?",
            [name, price, stock, id, userId]
        );
        return this.getById(id, userId);
    }

    // Delete a product by ID scoped to a user
    async delete(id, userId) {
        const [result] = await this.pool.execute(
            "DELETE FROM products WHERE id = ? AND user_id = ?",
            [id, userId]
        );
        return result.affectedRows > 0;
    }

    // --- DAILY HISTORY OPERATIONS ---

    // Calculate current totals for the active day
    async getOverallStats(userId) {
        const [rows] = await this.pool.execute(
            `SELECT 
                IFNULL(SUM(sold), 0) AS total_sold, 
                IFNULL(SUM(price * sold), 0) AS total_earnings 
             FROM products WHERE user_id = ?`,
            [userId]
        );
        return rows[0];
    }

    // Save snapshot to history table
    async saveDailyHistory(userId, totalSold, totalEarnings) {
        await this.pool.execute(
            `INSERT INTO daily_history (user_id, record_date, total_sold, total_earnings) 
             VALUES (?, CURDATE(), ?, ?)`,
            [userId, totalSold, totalEarnings]
        );
    }

    // Reset product sold counts back to 0
    async resetSoldCounts(userId) {
        await this.pool.execute(
            `UPDATE products SET sold = 0 WHERE user_id = ?`,
            [userId]
        );
    }

    // Get all history records for the user
    async getHistory(userId) {
        const [rows] = await this.pool.execute(
            `SELECT * FROM daily_history WHERE user_id = ? ORDER BY record_date DESC, created_at DESC`,
            [userId]
        );
        return rows;
    }
}