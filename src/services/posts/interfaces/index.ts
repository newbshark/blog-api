export interface BasicPostResponse {
    id: number;
    title: string;
    content: string;
}

export type UpdatePostResponse =
| { result: BasicPostResponse }
| { error: string }
| { message: string; error: string };


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