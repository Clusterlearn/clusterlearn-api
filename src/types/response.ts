import { avaliablePlatform } from "./modelData"

export type NewResponse<T> = {
    success: boolean,
    code:number,
    message:string,
    data: T
}

export type UserSignupResponse = {
    name:string,
    phone:string,
    email?: string,
    token:string
}

export type AddedUserToCourseResponse = {
    email: string,
    platform:avaliablePlatform,
    course : string,
    message: string,
    groupCount: {
        word : `${number}/${number}`, 
        total : number ,
        left : number,
        payment_link ?: string
    }
}

export type GetEmailVerifyResponse = {
    message:string,
    email:String,
    deviceToken ?: string
}



export type UserVerificationErrorResponse = {
    email?:string,
    message?:string
}

export type AddToCourseErrorResponse = {
    email: string,
    platform:avaliablePlatform,
    course : string,
    message: string
}
export type ServerErrorResponse = {
    message:string,
    errorcode: number
}

export type SuccessResponseData =   GetEmailVerifyResponse | AddedUserToCourseResponse;

export type ErrorResponseData = ServerErrorResponse  | UserVerificationErrorResponse | AddToCourseErrorResponse

export type ResponseData = SuccessResponseData|ErrorResponseData