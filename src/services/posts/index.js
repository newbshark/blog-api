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
    try {
        const userId = req.user.id;
        const { post_id, content, title } = req.body;

        console.log('Updating post:', { post_id, content, userId });

        if (!title){
            res.status(400).json({err: 'title must be at least 1 character'});
            return;
        }

        if(!post_id){
            return res.status(400).json({err:"missing post_id"});
        }
        if (post_id < 1) {
            return res.status(400).json({err:"bad request"});
        }
        if (!content || content.length < 3) {
            return res.status(400).json({
                message: "Content must be at least 3 characters long"
            });
        }

        const ifPostExist = await pool.query(
            'SELECT post_id FROM posts WHERE post_id = $1 AND "userId" = $2',
            [post_id, userId]
        );

        if (ifPostExist.rows.length === 0) {
            return res.status(404).json({message: 'post does not exist'});
        }

        const upgradedPost = await pool.query(
            'UPDATE posts SET content = $1, title = $4, updated_at = NOW() WHERE post_id = $2 AND "userId" = $3 RETURNING *',
            [content, post_id, userId, title]
        );

        return res.status(200).json({
            result: upgradedPost.rows[0]
        });

    } catch (error) {
        console.error('ERROR in updatePost:', error);
        return res.status(500).json({
            message: 'Internal server error',
            error: error.message  // временно, для отладки
        });
    }


}

export async function deletePost(req, res) {
    try {
        const userId = req.user.id;
        const postId = req.body.post_id;

        console.log('Delete attempt - User:', userId, 'Post:', postId);

        if (!postId) {
            return res.status(400).json({ error: 'missing post_id' });
        }

        // Use double quotes around "userId" to preserve case sensitivity
        const deletedPost = await pool.query(
            'DELETE FROM posts WHERE post_id = $1 AND "userId" = $2 RETURNING *',
            [postId, userId]
        );

        if (deletedPost.rows.length === 0) {
            return res.status(404).json({
                error: 'post does not exist or you do not have permission to delete it'
            });
        }

        return res.status(200).json({
            message: 'Post deleted successfully',
            post: deletedPost.rows[0]
        });

    } catch (error) {
        console.error('Error deleting post:', {
            message: error.message,
            code: error.code,
            detail: error.detail,
            hint: error.hint
        });

        return res.status(500).json({ error: 'Internal server error' });
    }
}