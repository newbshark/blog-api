import express from 'express';
import dotenv from 'dotenv';
import * as path from 'node:path';
const p = path.resolve(process.cwd(), '.env');
dotenv.config({ path: p});

import cors from 'cors';
import { jwtValidationMiddleware } from './middleware/authenticate.js';

import { login, register } from './services/auth/index.js';
import { createPost, getUsersPosts } from "./services/posts/index.js";

const app = express();

app.use(cors());
app.use(express.json());

app.post('/login', login);
app.post('/register', register);

app.use(jwtValidationMiddleware);

app.post('/posts/create', createPost);
app.get('/posts', getUsersPosts);

app.listen(process.env.PORT, () => {
    console.log(`Listening on port ${process.env.PORT}`);
});
