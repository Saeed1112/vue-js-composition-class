import {useAuth, useState} from "#imports";
import {EventEmitter} from "events";

export type Query = {
    $limit?: number,
    $search?: Object,
    $populate?: string[] | string | Object | Object[],
    $sort?: Object,
    $select?: string | string[],
    page?: number,
    [key: string]: any
}

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

export interface Paginated<T> {
    page: number,
    docs: T[],
    currentPage: number,
    nextPage: number | null,
    prevPage: number | null,
    limit: number,
    totalPages: number,
    totalDocs: number,
}


export interface InitState<T> {
    isFindPending: boolean,
    isCreatePending: boolean,
    isUpdatePending: boolean,
    isRemovePending: boolean,
    isGetPending: boolean,
    updateIds: string[],
    removeIds: string[],
    paginated: Paginated<T>,
    errors: any[],

    [key: string]: any,
}

export class Model<T> extends EventEmitter {
    STATE;
    PATH;
    FETCH;

    constructor(path: string, state?: any) {
        super()
        this.PATH = path;
        this.STATE = useState<InitState<T>>(this.PATH, () => ({
            isFindPending: false,
            isCreatePending: false,
            isUpdatePending: false,
            isRemovePending: false,
            isGetPending: false,
            updateIds: [],
            removeIds: [],
            paginated: {},
            errors: [],
            ...state
        }));
        const {authFetch} = useAuth();
        this.FETCH = authFetch;
        this.addListener(Events.ERROR, this.onErrorHandler)
    }

    async find(query?: Query): Promise<Paginated<T>> {
        try {
            this.STATE.value.isFindPending = true;
            const result = await this.FETCH<Paginated<T>>(this.PATH, {query})
            this.STATE.value.paginated = result;
            this.STATE.value.isFindPending = false;
            this.emit(Events.FIND, result)
            return result;
        } catch (e) {
            this.STATE.value.isFindPending = false;
            this.emit(Events.ERROR, e)
            throw e
        }
    }

    async get(id: string, query?: Query): Promise<T> {
        try {
            this.STATE.value.isGetPending = true;
            const result = await this.FETCH<T>(`${this.PATH}/${id}`, {query})
            this.STATE.value.isGetPending = false;
            this.emit(Events.GET, result)
            return result;
        } catch (e) {
            this.STATE.value.isGetPending = false;
            this.emit(Events.ERROR, e)
            throw e;
        }
    }

    async update(id: string, body: T, query?: Query): Promise<T> {
        try {
            this.STATE.value = {
                ...this.STATE.value,
                isUpdatePending: true,
                updateIds: [...this.STATE.value.updateIds, id]
            }
            const result = await this.FETCH<T>(`${this.PATH}/${id}`, {method: Methods.PUT, body, query});
            this.STATE.value = {
                ...this.STATE.value,
                isUpdatePending: false,
                updateIds: this.STATE.value.updateIds.filter((v: string) => v !== id)
            }
            this.emit(Events.UPDATED, id, result)
            return result;
        } catch (e) {
            this.STATE.value = {
                ...this.STATE.value,
                isUpdatePending: false,
                updateIds: this.STATE.value.updateIds.filter((v: string) => v !== id)
            }
            this.emit(Events.ERROR, e)
            throw e
        }
    }

    async remove(id: string, query?: Query): Promise<T> {
        try {
            this.STATE.value = {
                ...this.STATE.value,
                isRemovePending: true,
                removeIds: [...this.STATE.value.removeIds, id]
            }
            const result = await this.FETCH<T>(`${this.PATH}/${id}`, {method: Methods.DELETE, query});
            this.STATE.value = {
                ...this.STATE.value,
                isRemovePending: false,
                removeIds: this.STATE.value.removeIds.filter((v: string) => v !== id)
            }
            this.emit(Events.REMOVED, id, result)
            return result;
        } catch (e) {
            this.STATE.value = {
                ...this.STATE.value,
                isRemovePending: false,
                removeIds: this.STATE.value.removeIds.filter((v: string) => v !== id)
            }
            this.emit(Events.ERROR, e)
            throw e;
        }
    }

    async create(body: T): Promise<T> {
        try {
            this.STATE.value.isCreatePending = true;
            const result = await this.FETCH<T>(this.PATH, {method: Methods.POST, body})
            this.STATE.value.isCreatePending = false;
            this.emit(Events.CREATED, result)
            return result;
        } catch (e) {
            this.STATE.value.isCreatePending = false;
            this.emit(Events.ERROR, e)
            throw e
        }
    }

    get state() {
        return this.STATE.value;
    }

    onErrorHandler(e: any) {
        if (this.STATE.value.errors.length > 10)
            this.STATE.value.errors.pop()
        this.STATE.value.errors.unshift(e)
    }


}
