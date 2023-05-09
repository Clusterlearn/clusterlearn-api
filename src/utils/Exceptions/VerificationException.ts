import CustomException from "./CustomException";

export default class VerificationException extends CustomException {
    readonly code: number = 400;
    readonly email: string;
    constructor(message: string, email: any, code: number = 401) {
        super(message, {email}, 401);
        this.code = code;
        this.email = email
        Object.setPrototypeOf(this, VerificationException.prototype);
    }
}
