import {pool} from '../../config/index.js';

export async function getUsersPosts(req, res) {
    const userId = req.user.id;
    try {

        const getPosts = await pool.query(
            'SELECT id, title, content FROM posts WHERE user_id = $1',
            [userId]
        );

        if (getPosts.rows.length === 0) {
            return res.status(404).json({ notFound: true });
        }

        return res.status(200).json(getPosts.rows);
    } catch (err) {
        return res.status(500).json({ error: "Internal server error" });
    }
}

// Юзер создает пост
export async function createPost(req, res) {
    const userId = req.user.id; // 7
    const title = req.body.title;
    const content = req.body.content;
    const blogId = req.body.blog_id; //
    // {
    //     "title":"",
    //     "content":"",
    //     "blog_id":""
    // }// 4

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

    const isBlogExists = await pool.query('SELECT id FROM blogs WHERE id = $1 AND user_id = $2', [
        blogId, userId
    ]);
    if (isBlogExists.rows.length === 0) {
        res.status(404).json({});
        return;
    }

    const createdPostResult = await pool.query('INSERT INTO posts VALUES (DEFAULT, $1, $2, $3, $4, FALSE) RETURNING id', [
        title, content, userId, blogId
    ]);
    const postId = createdPostResult.rows[0].id;

    res.status(201).json({
        id: postId,
    });
}


export async function updatePost(req, res) {
    try {
        const userId = req.user.id;
        const {content, title} = req.body;
        const postId = req.params.id;

        console.log('Updating post:', {postId, content, userId});

        if (!title) {
            res.status(400).json({err: 'title must be at least 1 character'});
            return;
        }

        if (!postId) {
            return res.status(400).json({err: "missing post_id"});
        }
        if (postId < 1) {
            return res.status(400).json({err: "bad request"});
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
            return res.status(404).json({message: 'post does not exist'});
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
        return res.status(500).json({
            message: 'Internal server error',
            error: error.message  // временно, для отладки
        });
    }


}

export async function deletePost(req, res) {
    try {
        const userId = req.user.id;
        const postId = req.params.id;

        console.log('Delete attempt - User:', userId, 'Post:', postId);

        if (!postId) {
            return res.status(400).json({error: 'missing post_id'});
        }

        // Use double quotes around "userId" to preserve case sensitivity
        const deletedPost = await pool.query(
            'DELETE FROM posts WHERE id = $1 AND user_id = $2 RETURNING *', [
                postId, userId
            ]
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

        return res.status(500).json({error: 'Internal server error'});
    }
}