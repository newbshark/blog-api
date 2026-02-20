
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
    const userId = req.user.id;
    res.status(200).json({
        success: true,
        userId: userId,
        message: 'createPost',
    });
}

export async function updatePost(req, res)  {
    const userId = req.user.id;
}

export async function deletePost(req, res)  {
    const userId = req.user.id;
}

