export interface BasicPostResponse {
    id: number;
    title: string;
    content: string;
}

export interface UpdatePostResponse {
    result: BasicPostResponse;
}
