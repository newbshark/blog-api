import {pool} from "../../config/index.js";

export async function getUsersBlogs(req, res) {

    try {
    const userId = req.user.id;


        const getBlogs = await pool.query(
            'SELECT user_id, title FROM blogs WHERE user_id = $1',
            [userId]
        );
        if (getBlogs.rows.length === 0) {
            return res.status(404).json({notFound: true});
        }
        return res.status(200).json(getBlogs.rows);
    } catch (err) {
        return res.status(500).json({notFound: true});
    }
}

export async function createBlog(req, res) {
    try {
        const userId = req.user.id;
        const title = req.body.title;

        if (!title) {
            return res.status(400).json({ error: "title is required" });
        }

        if (title.length < 3) {
            return res.status(400).json({ error: "title too short (minimum 3 characters)" });
        }
        const createdBlog = await pool.query(
            'INSERT INTO blogs VALUES (DEFAULT, $1, $2) RETURNING *',
            [title, userId]
        );
        return res.status(201).json(createdBlog.rows[0]);

    }catch(err) {
        return res.status(500).json({error: 'something went wrong'});
    }
}

export async function updateBlog(req, res) {
    try {
        const userId = req.user.id;
        const title = req.body.title;
        const blogId = req.params.id;

        if (!title) {
            return res.status(400).json({error: "title is required"});
        }
        if (title.length < 3) {
            return res.status(400).json({error: "title too short (minimum 3 characters)"});
        }
        const isBlogExist = await pool.query(
            "SELECT id FROM blogs WHERE id = $1 AND user_id = $2",
            [blogId, userId]
        );
        if (isBlogExist.rows.length === 0) {
            return res.status(404).json({notFound: true});
        }

        const upgradedBlog = await pool.query("UPDATE blogs SET title = $1 WHERE id = $2 ", [title, blogId]);
        return res.status(200).json(upgradedBlog.rows[0]);

    } catch
        (err) {
        return res.status(500).json({error: 'something went wrong'});
    }
}

export async function deleteBlog(req, res) {
    try {
        const userId = req.user.id;
        const blogId = req.params.id;
        if (!blogId) {
            return res.status(400).json({error: "blogId is required"});
        }
        const deletedBlog = await pool.query('DELETE FROM blogs WHERE id = $1 AND user_id = $2 RETURNING *',[
            blogId, userId
        ]);
        if (deletedBlog.rows.length === 0) {
            return res.status(404).json({
                "error": "Blog not found or you don't have permission to delete it"
            });
        }
        return res.status(200).json(deletedBlog.rows[0], {message: "blog deleted successfully."});
    }
    catch (err) {
        return res.status(500).json({error: 'something went wrong'});
    }
}