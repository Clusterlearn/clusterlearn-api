import { Router } from "express";
import UserSignupController from "../controllers/register";
import {  avaliablePlatform } from '../types/modelData'
import responseHandler from "../utils/responseHandler";
import AddToCourseExceptions from "../utils/Exceptions/AddToCourseException";
import { VerifyEmail, codeSet, isVerified, sendEmailVerificationCode, setVerificationCode } from "../utils/verification";
import CustomException from "../utils/Exceptions/CustomException";
import VerificationException from "../utils/Exceptions/VerificationException";
import { generateToken, verifyToken } from "../services/jwt";

const router = Router();
    
router.post('/login', (req, res) => {
    console.log(req.query)
    res.send('Hello')
})

router.post('/getverify', async (req, res) => {
    const {email} = req.body
    console.log(email)
    try{
        if(!await codeSet(email)) await sendEmailVerificationCode(email, await setVerificationCode(email))
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
    const {email, code, rememberMe} = req.body
    try{
        if(!await VerifyEmail(email, code)) throw new VerificationException('Verification failed', email)
        return res.send(responseHandler.successJson({
            message : 'verified, Happy Learning',
            email:email,
            deviceToken: rememberMe  ? generateToken({email}, email) : undefined
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
    const { email, url, paid, rememberToken } : {email : string , url : string , paid : boolean, rememberToken:string|null } = req.body
    const version = paid ? 'paid' : 'free'
    try{
        if(rememberToken && !verifyToken(rememberToken, email)) throw new CustomException('Invalid token', {email:email, message:'Invalid token'}, 401)
        if(!await isVerified(email) && !rememberToken) throw new VerificationException('Email not verified', email)
        const data = await UserSignupController.register(url, email, paid);
        if(!data) throw new AddToCourseExceptions('somthing went wrong', url, 500);
        // const payment_data = paid ? { payment_link: data.groups['paid'].at(-1)?.members?.at(-1)?.payment_link } : {}
        const last_group_members = data.groups[version][data.groups[version].length - 1]?.members
        const payment_data = paid ? { payment_link: data.groups['paid'][data.groups['paid'].length - 1]?.members?.[data.groups['paid'][data.groups['paid'].length - 1]?.members?.length - 1]?.payment_link } : {}
        return res.status(200).json(responseHandler.successJson({
            email:email,
            platform: (new URL(url)).host as avaliablePlatform,
            course:data.link,
            message:`success course registration successfull, ${last_group_members.length == 8 ? 'meeting link sent to your email' : `${8 - (last_group_members.length ?? 0)} left`}`,
            groupCount: {
                word : `${last_group_members.length ?? 0}/8`,
                total: last_group_members.length??0,
                left: 8 - (last_group_members.length ?? 0),
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


router.get('/unregister', async (req, res) => {
    const { email, url, paid } : { email: string, url: string, paid: boolean } = req.query as unknown as { email: string, url: string, paid: boolean };
    const version = paid ? 'paid' : 'free'
    try {
        const {course, email_group} = await UserSignupController.unregister(url, email, paid);
        return res.status(200).send(`
        <h1>Success!</h1>
        <p>Your email ${email} has been removed from the course ${course?.link}.</p>
        <p>Thanks for using ClusterLearn
        `)
    }
    catch (e) {  
        const err = e as CustomException
        return res.status(err.code && err.code < 600 ? err.code : 500).send(`
        <h1>Error!</h1>
        <p>${err.message}</p>
        <p>Thanks for using ClusterLearn
        `)
    }
})

// an unregister route but with dynamic param in the url which is the course id 
router.get('/unregister/:token', async (req, res) => {
    const token = req.params.token
    try {
        const {course, email} = await UserSignupController.unregisterFromToken(token);
        return res.status(200).send(`
        <h1>Success!</h1>
        <p>Your email ${email} has been removed from the course ${course?.link}.</p>
        <p>Thanks for using ClusterLearn
        `)
    }
    catch (e) {  
        const err = e as CustomException
        return res.status(err.code && err.code < 600 ? err.code : 500).send(`
        <h1>Error!</h1>
        <p>${err.message}</p>
        <p>Thanks for using ClusterLearn
        `)
    }
})

export default router;