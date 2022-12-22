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
    pendingUpdateIds: string[],
    pendingRemoveIds: string[],
    docs: T[],
    paginated: Paginated<T>,
    error: any,

    [key: string]: any,
}

export interface IAuthSate {
    isAuthPending: boolean,
    isAuthenticated: boolean,
    user: IUser | null,
    accessToken: string,
    refreshToken: string,
    error: null | any,
    update: string | null,
    isGetProfilePending: boolean,
    isSignOutPending: boolean,
    isRefreshPending: boolean,
}

export interface IUser extends IBaseModel {
    email?: string;
    role?: string;
    name?: string;
}

export interface ISignInResult {
    readonly accessToken: string,
    readonly refreshToken?: string
    readonly user: IUser,
}

export interface IBaseModel {
    readonly _id?: string;
    readonly createdAt?: Date;
    readonly updatedAt?: Date;
    readonly __v?: number;
}

export interface Query {
    $limit?: number,
    $search?: Object,
    $populate?: string[] | string | object | object[],
    $sort?: Object,
    $select?: string | string[],
    page?: number,

    [key: string]: any
}




