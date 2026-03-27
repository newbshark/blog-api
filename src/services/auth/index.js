import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../../config/index.ts';

export async function login(req, res) {
    const body = req.body;
    if (!body) {
        res.status(400).send('No body provided in request.');
        return;
    }
    if (body.email?.length === 0 || body.password?.length === 0) {
        res.status(400).send();
        return;
    }

    const userFromDb = await pool.query('SELECT * FROM users WHERE email=$1', [
        body.email
        ]);

    if (userFromDb.rows.length === 0) {
        res.status(400).send('Invalid email or password');
        return;
    }

    const isValid = await bcrypt.compare(body.password, userFromDb.rows[0].password);
    if (!isValid) {
        res.status(400).send('Invalid email or password');
        return;
    }

    // Критичная часть
    const payload = {
        userId: userFromDb.rows[0].id,
    };
    //

    const expirationTime = '4h';
    const jwtSecret = process.env.JWT_SECRET;
    const jwtOptions = {
        expiresIn: expirationTime,
    };
    const accessToken = jwt.sign(payload, jwtSecret, jwtOptions);
    console.log(accessToken);

    res.json({
        accessToken
    });
}

export async function register(req, res) {
    // {
    //     "name": "Name",
    //     "email": "email",
    //     "password": "pass"
    // }
    const { name, email, password } = req.body;


    const existingUsers = await pool.query('SELECT id FROM users WHERE email=$1 OR name=$2 LIMIT 1', [
        email, name
    ]);
    if (existingUsers.rows.length > 0) {
        return res.status(400).send('User already exists');
    }
    const passwordHash = await bcrypt.hash(password, 10);

    const resultFromDB = await pool.query('INSERT INTO users VALUES (DEFAULT, $1, $2, $3) RETURNING id', [
        email, name, passwordHash
    ]);
    const userId = resultFromDB.rows[0].id;
    return res.status(200).send({ userId });
}
