import { pool } from '../../config/index.js';
import { Request, Response } from 'express';

export async function getUsersBlogs(req: Request, res: Response) {
    const userId: number|undefined = req.user?.id;
    const searchQuery: string | undefined =
        typeof req.query.searchQuery === 'string' ? req.query.searchQuery : undefined;
    let limit = parseInt(req.query.limit as string ?? '20');
    let page = parseInt(req.query.page as string ?? '1');

    if (isNaN(limit) || limit < 1) limit = 20;
    if (isNaN(page) || page < 1) page = 1;

    try {
        if(!userId){
            return res.status(401).json({ error: "User not authenticated" })
        }
        const queryParams: (number | string)[] = [userId];
        let paramsIndex = 2;
        let queryToDb = 'SELECT user_id, title FROM blogs WHERE user_id = $1';

        if (searchQuery) {
            queryToDb = `${queryToDb} AND title ILIKE $${paramsIndex}`;
            queryParams.push(`%${searchQuery}%`);

            paramsIndex++;
        }

        const offset = (page - 1) * limit;

        queryToDb = `${queryToDb} LIMIT $${paramsIndex}`;
        queryParams.push(limit);
        paramsIndex++;

        queryToDb = `${queryToDb} OFFSET $${paramsIndex}`;
        queryParams.push(offset);

        const getBlogs = await pool.query(queryToDb, queryParams);

        return res.status(200).json(getBlogs.rows);

    } catch (err) {
        console.error('Error in getUsersBlogs:', err);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export async function createBlog(req: Request, res: Response) {
    try {
        const userId = req.user?.id;
        const title = req.body.title;

        if (!title) {
            return res.status(400).json({ note: "title is required" });
        }

        if (title.length < 3) {
            return res.status(400).json({ note: "title too short (minimum 3 characters)" });
        }

        const createdBlog = await pool.query(
            'INSERT INTO blogs VALUES (DEFAULT, $1, $2) RETURNING *',
            [title, userId]
        );
        return res.status(201).json(createdBlog.rows[0]);

    } catch (err) {
        console.error('Error in createBlog:', err);
        return res.status(500).json({ error: 'something went wrong' });
    }
}

export async function updateBlog(req: Request, res: Response) {
    try {
        const userId = req.user?.id;
        const title = req.body.title;
        const blogId = req.params.id;

        if (!title) {
            return res.status(400).json({ note: "title is required" });
        }
        if (title.length < 3) {
            return res.status(400).json({ note: "title too short (minimum 3 characters)" });
        }

        const isBlogExist = await pool.query(
            "SELECT id FROM blogs WHERE id = $1 AND user_id = $2",
            [blogId, userId]
        );

        if (isBlogExist.rows.length === 0) {
            return res.status(404).json({ notFound: "blog doesn't exist" });
        }

        const upgradedBlog = await pool.query(
            "UPDATE blogs SET title = $1 WHERE id = $2 RETURNING *",
            [title, blogId]
        );
        return res.status(200).json(upgradedBlog.rows[0]);

    } catch (err) {
        console.error('Error in updateBlog:', err);
        return res.status(500).json({ error: 'something went wrong' });
    }
}

export async function deleteBlog(req: Request, res: Response) {
    try {
        const userId = req.user?.id;
        const blogId = req.params.id;

        if (!blogId) {
            return res.status(400).json({ note: "blogId is required" });
        }

        const deletedBlog = await pool.query(
            'DELETE FROM blogs WHERE id = $1 AND user_id = $2 RETURNING *',
            [blogId, userId]
        );

        if (deletedBlog.rows.length === 0) {
            return res.status(404).json({ message: "Blog not found" });
        }

        return res.status(200).json({
            message: "blog deleted successfully.",
            deleted: deletedBlog.rows[0],
        });

    } catch (err) {
        console.error('Error in deleteBlog:', err);
        return res.status(500).json({ error: 'something went wrong' });
    }
}