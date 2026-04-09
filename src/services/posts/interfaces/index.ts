export interface BasicPostResponse {
    id: number;
    title: string;
    content: string;
}

export interface UpdatePostResponse {
    result: BasicPostResponse;
}

export interface PostsQuery {
    searchQuery?: string;
    limit?: string;
    page?: string;
}

export interface CreatePostBody {
    title: string;
    content: string;
    blog_id: number;
}

export interface UpdatePostBody {
    title?: string;
    content?: string;
}