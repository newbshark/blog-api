import { pool } from '../../config/index.js';

export async function getUsersPosts(req, res)  {
    const userId = req.user.id;
    res.status(200).json({
        success: true,
        userId: userId,
        message: 'getUsersPosts',
    });
}

// Юзер создает пост
export async function createPost(req, res)  {
    const userId = req.user.id; // 7
    const title = req.body.title;
    const content = req.body.content;
    const blogId = req.body.blogId; // 4

    if (title.length < 3) {
        res.status(400).json({
            message: 'title must be at least 3 characters',
        });
        return;
    }

    if (content.length === 0) {
        res.status(400).json({
            message: 'content must be at least 1 character',
        })
        return;
    }

    const isBlogExists = await pool.query('SELECT id FROM blogs WHERE id = $1 AND user_id = $2', [blogId, userId]);
    if (isBlogExists.rows.length === 0) {
        res.status(404).json({});
        return;
    }

    const createdPostResult = await pool.query('INSERT INTO posts VALUES (DEFAULT, $1, $2, $3, $4) RETURNING id', [
        title, content, userId, blogId,
    ]);
    const postId = createdPostResult.rows[0].id;

    res.status(201).json({
        id: postId,
    });
}

export async function updatePost(req, res)  {
    const userId = req.user.id;
}

export async function deletePost(req, res)  {
    const userId = req.user.id;
}
