import express from 'express';

import cors from 'cors';
import {jwtValidationMiddleware} from './middleware/authenticate.js';

import {login, register} from './services/auth/index.js';
import {createPost, deletePost, getUsersPosts, updatePost} from "./services/posts/index.js";
import {getUsersBlogs} from "./services/blogs/index.js";

const app = express();

app.use(cors());
app.use(express.json());

app.post('/login', login);
app.post('/register', register);
app.use(jwtValidationMiddleware);

app.post('/posts', createPost);
app.patch('/posts/:id', updatePost);
app.delete('/posts/:id', deletePost);

app.get('/posts', getUsersPosts);

app.get('/blogs', getUsersBlogs);


app.listen(process.env.PORT, () => {
    console.log(`Listening on port ${process.env.PORT}`);
});
