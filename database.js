// Load environment variables from the env file
import "dotenv/config";
// Import the mysql library to connect to the database
import mysql from "mysql2/promise";

// Create and export a connection pool for the database
export const pool = mysql.createPool({
    // Set the database server address
    host: process.env.DB_HOST,
    // Set the port number for the database connection
    port: Number(process.env.DB_PORT),
    // Set the database username
    user: process.env.DB_USER,
    // Set the database password
    password: process.env.DB_PASSWORD,
    // Set the name of the database to use
    database: process.env.DB_NAME,
    // Configure secure connection settings
    ssl: {
        // Require a modern tls security version
        minVersion: "TLSv1.2",
        // Allow connections without a verified certificate
        rejectUnauthorized: false
    }
});