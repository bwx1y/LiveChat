export interface ContactResponse {
    id: string
    name: string
    email: string
    picture: string
    acc: boolean
    status: boolean
    newMessage: boolean
}

export interface FollowerResponse {
    id: string
    name: string
    email: string
    picture: string | null
}

export interface ContactAccRequest {
    userId: string
}

export interface ContactGetByIdResponse {
    id: string
    name: string
    email: string
    picture: string
    enableAdd: boolean
}
