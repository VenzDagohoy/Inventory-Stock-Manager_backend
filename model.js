export class ProductModel {
    constructor(pool) {
        this.pool = pool;
    }

    // Get all products, with filter by name
    async getAll(name) {
        if (name) {
            const [rows] = await this.pool.execute(
                "SELECT * FROM products WHERE name LIKE ?",
                [`%${name.toUpperCase().trim()}%`]
            );
            return rows;
        }
        const [rows] = await this.pool.query("SELECT * FROM products ORDER BY id ASC");
        return rows;
    }

    // Get product by ID
    async getById(id) {
        const [rows] = await this.pool.execute("SELECT * FROM products WHERE id = ?", [id]);
        return rows[0];
    }

    // Get product by name
    async getByName(name) {
        const [rows] = await this.pool.execute("SELECT * FROM products WHERE name = ?", [name]);
        return rows[0];
    }

    // Check if name is taken
    async getByNameExcludingId(name, id) {
        const [rows] = await this.pool.execute(
            "SELECT * FROM products WHERE name = ? AND id != ?",
            [name, id]
        );
        return rows[0];
    }

    // Add new product
    async create(name, price, stock) {
        const [result] = await this.pool.execute(
            "INSERT INTO products (name, price, stock) VALUES (?, ?, ?)",
            [name, price, stock]
        );
        return this.getById(result.insertId);
    }

    // Sell item
    async sell(id) {
        const [result] = await this.pool.execute(
            "UPDATE products SET stock = stock - 1 WHERE id = ? AND stock > 0",
            [id]
        );
        return result.affectedRows > 0;
    }

    // Update existing product
    async update(id, name, price, stock) {
        await this.pool.execute(
            "UPDATE products SET name = ?, price = ?, stock = ? WHERE id = ?",
            [name, price, stock, id]
        );
        return this.getById(id);
    }

    // Delete product by ID
    async delete(id) {
        const [result] = await this.pool.execute("DELETE FROM products WHERE id = ?", [id]);
        return result.affectedRows > 0;
    }
}