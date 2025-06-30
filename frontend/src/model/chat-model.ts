export interface ChatResponse {
    id: string
    form: string
    to: string
    message: string
    created: string
}

export interface ChatRequest {
    toUserId: string
    message: string
}
