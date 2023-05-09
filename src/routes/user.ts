import ReponseHandler from "@utils/responseHandler";
import { Router } from "express";
import UserSignupController from "@controllers/register";
import {  avaliablePlatform } from '../types/modelData'
import responseHandler from "@utils/responseHandler";
import AddToCourseExceptions from "@utils/Exceptions/AddToCourseException";
import { VerifyEmail, codeSet, isVerified, sendEmailVerificationCode, setVerificationCode } from "@utils/verification";
import CustomException from "@utils/Exceptions/CustomException";
import VerificationException from "@utils/Exceptions/VerificationException";

const router = Router();

router.post('/login', (req, res) => {
    console.log(req.query)
    res.send('Hello')
})

router.post('/getverify', async (req, res) => {
    const {email} = req.body
    console.log(email)
    try{
        let code_is_sent = await codeSet(email)
        if(!code_is_sent) await sendEmailVerificationCode(email, await setVerificationCode(email))
        return res.send(responseHandler.successJson({
            message : 'verification code sent',
            email:email
        }))
    }catch(e) {
        const err = e as CustomException
        res.status(err.code && err.code < 600 ? err.code : 500).send(responseHandler.errorJson({
            message:err.message,
            email:email
        }))
    }
})

router.post('/verify', async (req, res) => {
    const {email, code} = req.body
    try{
        if(!await VerifyEmail(email, code)) throw new VerificationException('Verification failed', email)
        return res.send(responseHandler.successJson({
            message : 'verified, Happy Learning',
            email:email
        }))
    }catch(e) {
        const err = e as CustomException
        res.status(err.code && err.code < 600 ? err.code : 500).send(responseHandler.errorJson({
            message:err.message,
            email:email
        }))
    }
})

router.post('/register',  async (req, res) => {
    const { email, url, paid } : {email : string , url : string , paid : boolean } = req.body
    const version = paid ? 'paid' : 'free'
    try{
        if(!await isVerified(email)) throw new VerificationException('Email not verified', email)
        const data = await UserSignupController.register(url, email, paid);
        console.log('GEre')
        if(!data) throw new AddToCourseExceptions('somthing went wrong', url, 500);
        const payment_data = paid ? {payment_link : data.groups['paid'].at(-1)?.members?.at(-1)?.payment_link} :  {}
        return res.status(200).json(responseHandler.successJson({
            email:email,
            platform: (new URL(url)).host as avaliablePlatform,
            course:data.link,
            message:`success course registration successfull, ${data.groups[version].at(-1)?.members?.length == 8 ? 'meeting link sent to your email' : `${8 - (data.groups[version].at(-1)?.members?.length ?? 0)} left`}`,
            groupCount: {
                word : `${data.groups[version].at(-1)?.members?.length ?? 0}/8`,
                total: data.groups[version].at(-1)?.members?.length??0,
                left: 8 - (data.groups[version].at(-1)?.members?.length ?? 0),
                ...payment_data
            }
        }))
    }
    catch(err: any){
        err as AddToCourseExceptions
        console.log('HEre', err.code, err.link, (err as Error).stack)
        return  res.status(err.code && err.code < 600 ? err.code : 500).send(responseHandler.errorJson({
            email : email, 
            platform: err.platform,
            course: url,
            message: err.message
        }))
    }
})

// router.post("/verify/phone", async (req, res) => {
//     const { code , phone} = req.body
//     try{
//         if (!code) throw new CustomException("Empty Code", {phone:phone, message:"error valiadting code"}, 206)
//         const verified = await UserSignupController.verify(phone, code)
//         if(!verified) throw new CustomException("User does not exist", {message: "cant verify user try again later"}, 300)
//         if ((!verified?.name || !verified?.phone) && "message" in verified) throw new CustomException(verified?.message, verified, 300)
//         const user = verified as CourseReg
//         return res.status(200).json(ReponseHandler.successJson({
//             name: user?.name,
//             password: "****",
//             email: user.email ?? "",
//             verify:user.verify,
//             phone: user?.phone
//         }, "User phone verification successful", 200))
//     }
//     catch(e)
//     {
//         let error = e as CustomException
//         return res.status(error.code).json(ReponseHandler.errorJson(error.data ?? {
//             message: error.message,
//             errorcode: error.code
//         }, error.message ?? "Server Error", error.code));
//     }
// })
export default router;