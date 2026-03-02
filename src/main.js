import express from 'express';

import cors from 'cors';
import { jwtValidationMiddleware } from './middleware/authenticate.js';

import { login, register } from './services/auth/index.js';
import { createPost, getUsersPosts } from "./services/posts/index.js";
import {dbConfig} from "./config/index.js";

const app = express();

app.use(cors());
app.use(express.json());

app.post('/login', login);
app.post('/register', register);
console.log(dbConfig);
app.use(jwtValidationMiddleware);

app.post('/posts', createPost);
app.get('/posts', getUsersPosts);

app.listen(process.env.PORT, () => {
    console.log(`Listening on port ${process.env.PORT}`);
});
