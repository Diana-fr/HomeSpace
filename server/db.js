// server/db.js
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Проверяем, что переменные есть
console.log('🔍 DB HOST:', process.env.MYSQLHOST);
console.log('🔍 DB PORT:', process.env.MYSQLPORT);
console.log('🔍 DB USER:', process.env.MYSQLUSER);
console.log('🔍 DB NAME:', process.env.MYSQLDATABASE);

// Используем ТОЛЬКО переменные Railway — без fallback значений!
const pool = mysql.createPool({
    host: process.env.MYSQLHOST,
    port: parseInt(process.env.MYSQLPORT),
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Database connected successfully');
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        return false;
    }
}

export async function query(sql, params = []) {
    try {
        const [results] = await pool.execute(sql, params);
        return results;
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
}

export { pool };