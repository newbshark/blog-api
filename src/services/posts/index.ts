import { pool } from '../../common/config/index.js';
import { Request, Response } from 'express';
import { LoggerService } from '../../common/logger/index.js';
import type { PostsQuery } from './interfaces/index.js';
import type { 
    UpdatePostBody, 
    CreatePostBody, 
    BasicPostResponse, 
    UpdatePostResponse 
} from './interfaces/index.js';

const logger = new LoggerService();


export async function getUsersPosts(req: Request, res: Response) {
    const userId = req.user?.id ?? 7;

    const { searchQuery, limit, page } = req.query as PostsQuery;

    const parsedLimit = parseInt(limit ?? '20');
    const parsedPage = parseInt(page ?? '1');

    const safeLimit = Number.isNaN(parsedLimit) || parsedLimit < 1 ? 20 : parsedLimit;
    const safePage = Number.isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;
    

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
        queryParams.push(safeLimit);
        paramsIndex++;

        const offset = (safePage - 1) * safeLimit;
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
    const { title, content, blog_id } = req.body as CreatePostBody; 
    const userId = req.user?.id;
    const blogId = blog_id;

    if (!title || title.length < 3) {
        return res.status(400).json({
            error: 'bad_request'
        });
    }

    if (!content || content.length === 0) {
        return res.status(400).json({ error:'bad_request'});
    }

    const isBlogExists = await pool.query(
        'SELECT id FROM blogs WHERE id = $1 AND user_id = $2',
        [blogId, userId]
    );

    if (isBlogExists.rows.length === 0) {
        return res.status(404).json({ error: 'blog_not_found' });
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

export async function updatePost(
    req: Request<{ id: string }, UpdatePostResponse, UpdatePostBody>,
    res: Response<UpdatePostResponse>
    ): Promise<Response<UpdatePostResponse>> {
    const { content, title } = req.body ;
    const userId = req.user?.id;
    const postId = Number(req.params.id);

    try {
        logger.info('Updating post',
            'update-post-started',
            {
                userId, postId, content, title,
            });
        if (!title) {
            return res.status(400).json({ error: 'bad_request' });
        }

        if (!postId || isNaN(postId) || postId < 1) {
            return res.status(400).json({ error: 'bad_request' });
        }

        if (!content || content.length < 3) {
            return res.status(400).json({
                error: 'bad_request'
            });
        }

        const isPostExist = await pool.query(
            'SELECT id FROM posts WHERE id = $1 AND user_id = $2',
            [postId, userId]
        );

        if (isPostExist.rows.length === 0) {
            return res.status(404).json({ error: 'post_not_found' });
        }

        const upgradedPost = await pool.query<BasicPostResponse>(
            'UPDATE posts SET content = $1, title = $2 WHERE id = $3 AND user_id = $4 RETURNING *',
            [content, title, postId, userId]
        );

        return res.status(200).json({
            result: upgradedPost.rows[0],
        });
    } catch (error) {
        logger.error('Error in updating post', 'update-post-error', {
            error,
            userId,
            postId,
        });
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
            return res.status(400).json({ error: 'bad_request' });
        }

        const deletedPost = await pool.query(
            'DELETE FROM posts WHERE id = $1 AND user_id = $2 RETURNING *',
            [postId, userId]
        );

        if (deletedPost.rows.length === 0) {
            return res.status(404).json({ error: 'post_not_found' });
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
