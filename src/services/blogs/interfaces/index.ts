export interface CreateBlogRequest {
    title: string;
}

export interface CreateBlogResponse {
    id: number;
    user_id: number;
    title: string;
}
