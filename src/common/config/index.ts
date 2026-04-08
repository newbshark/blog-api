import pg from 'pg';
import dotenv from 'dotenv';
import * as path from 'node:path';
const p = path.resolve(process.cwd(), '.env');
dotenv.config({
    path: p,
});
console.log(p);

const dbPort = parseInt(process.env.DB_PORT ?? '5432');

const pool = new pg.Pool({
    host: 'localhost',
    port: dbPort,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

if (process.env.JWT_SECRET === undefined) {
    console.error('JWT_SECRET is not defined in environment variables');
    throw new Error('JWT_SECRET is not defined in environment variables');
}

export const jwtSecret = process.env.JWT_SECRET;


export { pool };
