import {pool} from "../../config/index.js";

export async function getUsersBlogs(req, res) {
    const userId = req.user.id;
    try {

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