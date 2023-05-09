import { ErrorResponseData, NewResponse, ResponseData, ServerErrorResponse, SuccessResponseData, UserSignupResponse } from "src/types/response";

export default class ReponseHandler{
    constructor() {

    }

    public static json(success: boolean, data: ResponseData, message?: string, code?: number): NewResponse<ResponseData>
    {
        return {
            status: success ? "success" : "error",
            message : message ?? "",
            code : code ?? 200,
            data : data
        } 
    }

    public static successJson(data: SuccessResponseData, message?: string, code?: number): NewResponse<SuccessResponseData>
    {
        return this.json(true, data, message ?? data?.message, code) as NewResponse<SuccessResponseData>;
    }
    
    public static errorJson(data: ErrorResponseData, message?: string, code?: number): NewResponse<ErrorResponseData>
    {
        return this.json(false, data, message ?? data?.message, code ?? 400) as NewResponse<ErrorResponseData>;
    }
    
    public static serverErrorJson(data: ServerErrorResponse, message?: string, code?: number): NewResponse<ServerErrorResponse>
    {
        return this.json(false, data, message ?? "server Error", code ?? 500) as NewResponse<ServerErrorResponse>;
    }
}