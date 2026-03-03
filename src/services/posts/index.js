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

    const isBlogExists = await pool.query('SELECT id FROM blogs WHERE id = $1 AND created_by = $2', [blogId, userId]);
    if (isBlogExists.rows.length === 0) {
        res.status(404).json({});
        return;
    }

    const createdPostResult = await pool.query('INSERT INTO posts VALUES (DEFAULT, $1, $2, $3, $4) RETURNING post_id', [
        title, content, userId, blogId,
    ]);
    const postId = createdPostResult.rows[0].id;

    res.status(201).json({
        id: postId,
    });
}

export async function updatePost(req, res)  {
    const userId = req.user.id;
    const postId = req.body.post_id;
    const content = req.body.content;
    if (content.length < 3||content.length === 0) {
        res.status(400).json({ message: "Content must be at least 3 characters long" });
        return;
    }
    const ifPostExist = await pool.query('SELECT post_id FROM posts WHERE post_id = $1 AND "userId" = $2',
        [postId, userId]);
    if (ifPostExist.rows.length === 0) {
        res.status(404).json({message: 'post does not exist'});
        return;
    }
    const upgradedPost = await pool.query('UPDATE posts SET content = $1, updated_at = NOW() WHERE post_id = $2 AND "userId" = $3 RETURNING *',
        [content, postId, userId]);
    const upgradedPostResult = upgradedPost.rows[0];
    res.status(200).json({
        result: upgradedPostResult,
    });



}

export async function deletePost(req, res)  {
    const userId = req.user.id;
}
