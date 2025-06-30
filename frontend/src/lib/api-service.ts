import axios from 'axios';

interface ApiErrorResponse {
    message: string;
    response: {
        data: {
            status: number;
            errors: Record<string, string[]>
        }
    }
}

interface ReturnResponse<T> {
    status: number;
    message: string;
    data: T
}

class ApiService {
    private readonly api;

    constructor(apiUrl: string) {
        this.api = axios.create({
            baseURL: apiUrl,
        })
    }

    private validationError(e: unknown) {
        const data = (e as ApiErrorResponse).response.data
        const response: ReturnResponse<null> = {
            status: data.status,
            message: (e as ApiErrorResponse).message,
            data: null
        }

        try {
            if ('request' in data.errors && Array.isArray(data.errors['request'])) {
                response.message = data.errors['request'][0]
                return response
            }

            const message: string[] = [];
            for (const key in data.errors) {
                if (Array.isArray(data.errors[key])) {
                    message.push(...data.errors[key]);
                }
            }

            response.message = message[0]
            return response
        } catch {
            return response
        }
    }

    public async get<Response>(url: string, {key}: { key: string | null }) {
        try {
            const config = key != null ? {
                headers: {
                    authorization: `Bearer ${key}`,
                }
            } : {};

            const response = await this.api.get<Response>(url, config);
            return {
                status: response.status,
                message: response.statusText,
                data: response.data
            } as ReturnResponse<Response>;
        } catch (e) {
            return this.validationError(e);
        }
    }

    public async post<Response, Request>(url: string, {key, body}: { key: string | null, body: Request }) {
        try {
            const config = key != null ? {
                headers: {
                    authorization: `Bearer ${key}`,
                }
            } : {};

            const response = await this.api.post<Response>(url, body, config);
            return {
                status: response.status,
                message: response.statusText,
                data: response.data
            } as ReturnResponse<Response>;
        }
        catch (e) {
            return this.validationError(e);
        }
    }

    public async put<Response, Request>(url: string, {key, body}: { key: string | null, body: Request }) {
        try {
            const config = key != null ? {
                headers: {
                    authorization: `Bearer ${key}`,
                }
            } : {};

            const response = await this.api.put<Response>(url, body, config);
            return {
                status: response.status,
                message: response.statusText,
                data: response.data
            } as ReturnResponse<Response>;
        }
        catch (e) {
            return this.validationError(e);
        }
    }

    public async delete<Response>(url: string, {key}: { key: string | null }) {
        try {
            const config = key != null ? {
                headers: {
                    authorization: `Bearer ${key}`,
                }
            } : {};

            const response = await this.api.delete<Response>(url, config);
            return {
                status: response.status,
                message: response.statusText,
                data: response.data
            } as ReturnResponse<Response>;
        } catch (e) {
            return this.validationError(e);
        }
    }
}

export const apiService = new ApiService("/api")
