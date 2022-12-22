import {authFetch, useState} from "#imports";
import {InitState, Paginated, Query} from "~/type/interfaces";


export enum Events {
    ERROR = 'error',
    UPDATED = 'updated',
    REMOVED = 'removed',
    CREATED = 'created',
    FIND = 'find',
    GET = 'get'
}

export enum Methods {
    PUT = 'put',
    POST = 'post',
    GET = 'get',
    DELETE = 'delete'
}


export class BaseModel<T, S = any> {
    STATE;
    PATH;
    FETCH;

    constructor(path: string, state?: any) {
        this.PATH = path;
        this.STATE = useState<InitState<T> & S>(this.PATH, () => ({
            isFindPending: false,
            isCreatePending: false,
            isUpdatePending: false,
            isRemovePending: false,
            isGetPending: false,
            pendingUpdateIds: [],
            pendingRemoveIds: [],
            paginated: {
                docs: [],
                page: 1,
                totalPages: 1,
                limit: 21,
                currentPage: 1,
                nextPage: null,
                prevPage: null,
                totalDocs: 1
            },
            error: null,
            ...state
        }));
        this.FETCH = authFetch;
    }


    async find(query?: Query, server?: boolean) {
        return this.FETCH<Paginated<T>>(this.PATH, {
            server,
            query,
            onRequest: () => {
                this.STATE.value = {
                    ...this.STATE.value,
                    error: null,
                    isFindPending: true
                }
            },
            onResponse: ({response}) => {
                if (!response.ok) return;
                this.STATE.value = {
                    ...this.STATE.value,
                    isFindPending: false,
                    paginated: response._data
                }

            },
            onResponseError: ({response}) => {
                this.STATE.value = {
                    ...this.STATE.value,
                    isFindPending: false,
                    error: response._data
                }
            }
        })

    }

    async get(id: string, query?: Query, server?: boolean) {
        return this.FETCH<T>(`${this.PATH}/${id}`, {
            query,
            server,
            onRequest: () => {
                this.STATE.value = {
                    ...this.STATE.value,
                    error: null,
                    isGetPending: true
                }
            },
            onResponse: ({response}) => {
                if (!response.ok) return;
                this.STATE.value = {
                    ...this.STATE.value,
                    isGetPending: false,
                    error: null,
                }

            },
            onResponseError: ({response}) => {
                this.STATE.value = {
                    ...this.STATE.value,
                    isGetPending: false,
                    error: response._data
                }
            }
        })
    }

    async update(id: string, body: T, query?: Query, server?: boolean) {
        return this.FETCH<T>(`${this.PATH}/${id}`, {
            method: Methods.PUT,
            query,
            body,
            server,
            onRequest: () => {
                this.STATE.value = {
                    ...this.STATE.value,
                    isUpdatePending: true,
                    pendingUpdateIds: [...this.STATE.value.pendingUpdateIds, id]
                }
            },
            onResponse: ({response}) => {
                if (!response.ok) return;
                this.STATE.value = {
                    ...this.STATE.value,
                    isUpdatePending: false,
                    pendingUpdateIds: this.STATE.value.pendingUpdateIds.filter((v: string) => v !== id)
                }

            },
            onResponseError: ({response}) => {
                this.STATE.value = {
                    ...this.STATE.value,
                    isUpdatePending: false,
                    pendingUpdateIds: this.STATE.value.pendingUpdateIds.filter((v: string) => v !== id),
                    error: response._data
                }
            }
        })

    }

    async remove(id: string, query?: Query, server?: boolean) {
        return this.FETCH<T>(`${this.PATH}/${id}`, {
            method: Methods.DELETE,
            query,
            server,
            onRequest: () => {
                this.STATE.value = {
                    ...this.STATE.value,
                    isRemovePending: true,
                    pendingRemoveIds: [...this.STATE.value.pendingRemoveIds, id]
                }
            },
            onResponse: ({response}) => {
                if (!response.ok) return;
                this.STATE.value = {
                    ...this.STATE.value,
                    isRemovePending: false,
                    pendingRemoveIds: this.STATE.value.pendingRemoveIds.filter((v: string) => v !== id)
                }
            },
            onResponseError: ({response}) => {
                this.STATE.value = {
                    ...this.STATE.value,
                    isRemovePending: false,
                    pendingRemoveIds: this.STATE.value.pendingRemoveIds.filter((v: string) => v !== id),
                    error: response._data
                }
            }
        })
    }

    async create(body: T, query?: Query, server?: boolean) {
        return this.FETCH<T>(this.PATH, {
            query,
            server,
            method: Methods.POST,
            onRequest: () => {
                this.STATE.value = {
                    ...this.STATE.value,
                    error: null,
                    isCreatePending: true
                }
            },
            onResponse: ({response}) => {
                if (!response.ok) return;
                this.STATE.value = {
                    ...this.STATE.value,
                    isCreatePending: false,
                    error: null,
                }

            },
            onResponseError: ({response}) => {
                this.STATE.value = {
                    ...this.STATE.value,
                    isCreatePending: false,
                    error: response._data
                }
            }
        })
    }

    get state(): InitState<T> & S {
        const {value} = this.STATE;
        return value;
    }

    get paginated(): Paginated<T> {
        const {paginated} = this.STATE.value;
        return paginated;
    }

    get isFindPending(): boolean {
        const {isFindPending} = this.STATE.value;
        return isFindPending;
    }

    get isUpdatePending(): boolean {
        const {isUpdatePending} = this.STATE.value;
        return isUpdatePending;
    }

    get isRemovePending(): boolean {
        const {isRemovePending} = this.STATE.value;
        return isRemovePending;
    }

    get isCreatePending(): boolean {
        const {isCreatePending} = this.STATE.value;
        return isCreatePending;
    }

    get isGetPending(): boolean {
        const {isGetPending} = this.STATE.value;
        return isGetPending;
    }

    get pendingUpdateIds(): string[] {
        const {pendingUpdateIds} = this.STATE.value;
        return pendingUpdateIds;
    }

    get pendingRemoveIds(): string[] {
        const {pendingRemoveIds} = this.STATE.value;
        return pendingRemoveIds;
    }

    get error(): any {
        const {error} = this.STATE.value;
        return error;
    }


}
