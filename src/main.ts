import express from 'express';

import cors from 'cors';
import { jwtValidationMiddleware } from './common/middleware/authenticate.js';

import {login, register} from './services/auth/index.js';
import {createPost, deletePost, getUsersPosts, updatePost} from './services/posts/index.js';
import {deleteBlog, getUsersBlogs, updateBlog} from './services/blogs/index.js';
import {createBlog} from './services/blogs/index.js';
import { LoggerService } from './common/logger/index.js';
import { errorhandler } from './common/middleware/error-handler.js';
import { asynchandler } from './common/middleware/async-handler.js';

const logger = new LoggerService();

const app = express();

app.use(cors());
app.use(express.json());

app.post('/login', asynchandler(login));
app.post('/register', asynchandler(register));

app.use(jwtValidationMiddleware);

app.post('/posts', asynchandler(createPost));
app.patch('/posts/:id', asynchandler(updatePost));
app.delete('/posts/:id', asynchandler(deletePost));

app.get('/posts', asynchandler(getUsersPosts));

app.get('/blogs', asynchandler(getUsersBlogs));
app.post('/blogs', asynchandler(createBlog));
app.patch('/blogs/:id', asynchandler(updateBlog));
app.delete('/blogs/:id', asynchandler(deleteBlog));

app.use(errorhandler);

app.listen(process.env.PORT, () => {
    logger.info(`Server started on port ${process.env.PORT}`, 'server-start', {
        port: process.env.PORT,
    });
});
