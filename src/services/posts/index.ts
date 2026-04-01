import { pool } from '../../config/index.js';
import { Request, Response } from 'express';

// limit=20&page=1&searchQuery=солнышко
export async function getUsersPosts(req: Request, res: Response) {
    const userId = req.user?.id ?? 7;

    const searchQuery = req.query.searchQuery;
    const limit = parseInt(req.query.limit as string ?? '20');
    const page = parseInt(req.query.page as string ?? '1');

    try {
        let queryToDb = 'SELECT id, title, content FROM posts WHERE user_id = $1';
        const queryParams: (number | string)[] = [userId];
        let paramsIndex = 2;

        if (searchQuery) {
            queryToDb = `${queryToDb} AND (title ILIKE $${paramsIndex} OR content ILIKE $${paramsIndex})`;
            queryParams.push(`%${searchQuery}%`);
            paramsIndex++;
        }

        queryToDb = `${queryToDb} LIMIT $${paramsIndex}`;
        queryParams.push(limit);
        paramsIndex++;

        const offset = (page - 1) * limit;
        queryToDb = `${queryToDb} OFFSET $${paramsIndex}`;
        queryParams.push(offset);

        const getPosts = await pool.query(queryToDb, queryParams);

        return res.status(200).json(getPosts.rows);

    } catch (err) {
        console.error('Error in getUsersPosts:', err);
        return res.status(500).json({ error: "Internal server error" });
    }
}

// Юзер создает пост
export async function createPost(req: Request, res: Response) {
    const userId = req.user?.id;
    const title = req.body.title;
    const content = req.body.content;
    const blogId = req.body.blog_id;

    if (!title || title.length < 3) {
        return res.status(400).json({
            message: 'title must be at least 3 characters',
        });
    }

    if (!content || content.length === 0) {
        return res.status(400).json({ note: "fill content line" });
    }

    const isBlogExists = await pool.query(
        'SELECT id FROM blogs WHERE id = $1 AND user_id = $2',
        [blogId, userId]
    );

    if (isBlogExists.rows.length === 0) {
        return res.status(404).json({ error: "Blog not found" });
    }

    const createdPostResult = await pool.query(
        'INSERT INTO posts VALUES (DEFAULT, $1, $2, $3, $4, FALSE) RETURNING id',
        [title, content, userId, blogId]
    );
    const postId = createdPostResult.rows[0].id;

    return res.status(201).json({
        id: postId,
    });
}

export async function updatePost(req: Request, res: Response) {
    try {
        const userId = req.user?.id;
        const { content, title } = req.body;
        const postId = Number(req.params.id);

        console.log('Updating post:', { postId, content, userId });

        if (!title) {
            return res.status(400).json({ note: 'title must be at least 1 character' });
        }

        if (!postId || isNaN(postId) || postId < 1) {
            return res.status(400).json({ note: "bad request" });
        }

        if (!content || content.length < 3) {
            return res.status(400).json({
                message: "Content must be at least 3 characters long"
            });
        }

        const isPostExist = await pool.query(
            'SELECT id FROM posts WHERE id = $1 AND user_id = $2',
            [postId, userId]
        );

        if (isPostExist.rows.length === 0) {
            return res.status(404).json({ error: "Post not found" });
        }

        const upgradedPost = await pool.query(
            'UPDATE posts SET content = $1, title = $2 WHERE id = $3 AND user_id = $4 RETURNING *',
            [content, title, postId, userId]
        );

        return res.status(200).json({
            result: upgradedPost.rows[0]
        });

    } catch (error) {
        console.error('ERROR in updatePost:', error);
        const err = error as any;
        return res.status(500).json({
            message: 'Internal server error',
            error: err.message
        });
    }
}

export async function deletePost(req: Request, res: Response) {
    try {
        const userId = req.user?.id;
        const postId = req.params.id;

        console.log('Delete attempt - User:', userId, 'Post:', postId);

        if (!postId) {
            return res.status(400).json({ note: 'missing post_id' });
        }

        const deletedPost = await pool.query(
            'DELETE FROM posts WHERE id = $1 AND user_id = $2 RETURNING *',
            [postId, userId]
        );

        if (deletedPost.rows.length === 0) {
            return res.status(404).json({ error: "Post not found" });
        }

        return res.status(200).json({
            message: 'Post deleted successfully',
            post: deletedPost.rows[0]
        });

    } catch (error) {
        const err = error as any;
        console.error('Error deleting post:', {
            message: err.message,
            code: err.code,
            detail: err.detail,
            hint: err.hint
        });

        return res.status(500).json({ error: 'Internal server error' });
    }
}