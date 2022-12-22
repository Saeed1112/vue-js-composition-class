import {IAuthSate, ISignInResult, IUser} from "~/type/interfaces";
import {useAppConfig, useCookie, useFetch, useState} from "#app";
import {Methods} from "~/type/base-model";
import {FetchOptions} from "ofetch";
import qs from "qs";

class Auth {

    private readonly STATE;
    private ENDPOINT;

    constructor() {
        this.STATE = useState<IAuthSate>(Auth.name, () => ({
            isAuthPending: false,
            isAuthenticated: false,
            isSignOutPending: false,
            isRefreshPending: false,
            isGetProfilePending: false,
            accessToken: '',
            refreshToken: '',
            user: null,
            error: null,
            update: null
        }))
        this.ENDPOINT = useAppConfig().endpoint;

    }


    get state(): IAuthSate {
        const {value} = this.STATE;
        return {...value}
    }

    get isAuthenticated() {
        const {isAuthenticated} = this.STATE.value
        return isAuthenticated;
    }

    get isGetProfilePending() {
        const {isGetProfilePending} = this.STATE.value
        return isGetProfilePending;
    }

    get isRefreshPending() {
        const {isRefreshPending} = this.STATE.value
        return isRefreshPending;
    }

    get isAuthPending() {
        const {isAuthPending} = this.STATE.value
        return isAuthPending;
    }

    get isSignOutPending() {
        const {isAuthPending} = this.STATE.value
        return isAuthPending;
    }

    get accessToken() {
        const {accessToken} = this.STATE.value
        return accessToken;
    }

    get refreshToken() {
        const {refreshToken} = this.STATE.value
        return refreshToken;
    }

    get user() {
        const {user} = this.STATE.value
        return user;
    }


    async signIn(email: string, password: string) {
        return useFetch<ISignInResult>(`${this.ENDPOINT}/auth/signin`, {
            server: false,
            body: {email, password},
            method: Methods.POST,
            onRequest: () => {
                this.STATE.value = {
                    ...this.STATE.value,
                    isAuthPending: true,
                    isAuthenticated: false,
                    error: null
                }
            },
            onResponse: (context) => {
                const {response} = context;
                if (response.ok) {
                    const {accessToken, user} = response._data;
                    this.STATE.value = {
                        ...this.STATE.value,
                        isAuthPending: false,
                        isAuthenticated: true,
                        update: new Date().toString(),
                        user, accessToken,
                    }
                    const accessTokenCookie = useCookie('accessToken', {secure: true});
                    accessTokenCookie.value = accessToken;
                }
            },
            onResponseError: (context) => {
                const {_data} = context.response;
                this.STATE.value = {
                    ...this.STATE.value,
                    error: _data,
                    isAuthPending: false,
                    isAuthenticated: false,
                    update: new Date().toString(),
                }
            }
        })
    }

    async signOut(refreshToken: string) {
    }

    async refresh(token: string) {
    }

    async signUp(email: string, password: string) {
    }

    async profile() {
        const accessToken = useCookie('accessToken')
        if (!this.isAuthenticated) return;
        return useFetch<IUser>(`${this.ENDPOINT}/auth/profile`, {
            server: false,
            headers: {
                authorization: `Bearer ${accessToken.value}`
            },
            method: Methods.POST,
            onRequest: () => {
                this.STATE.value = {
                    ...this.STATE.value,
                    error: null,
                    isGetProfilePending: true,
                }
            },
            onResponse: (context) => {
                const {response} = context;
                if (response.ok) {
                    this.STATE.value = {
                        ...this.STATE.value,
                        isGetProfilePending: false,
                        update: new Date().toString(),
                        user: response._data
                    }
                }
            },
            onResponseError: (context) => {
                const {_data} = context.response;
                this.STATE.value = {
                    ...this.STATE.value,
                    error: _data,
                    isGetProfilePending: false,
                    update: new Date().toString(),
                }
            }
        })
    }

}

export const useAuth = () => new Auth();


export const authFetch = async <T>(request: string, options?: FetchOptions & { [key: string]: any }, server?: boolean) => {
    return useFetch<T>(`${request}?${qs.stringify({...{...options?.query}, __a: true})}`, {
        server,
        baseURL: useAppConfig().endpoint,
        ...options,
        headers: {
            ...options?.headers,
            authorization: `Bearer ${useAuth().accessToken}`
        },
        query: {}
    })

}
