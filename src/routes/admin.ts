import { generateAdminGoogleAuthUrl, saveAccessToken } from "@/services/google";
import responseHandler from "@/utils/responseHandler";
import { Router } from "express";

const router = Router();



router.use(function (req, res, next) {
    // check header or url parameters or post parameters for token
    const token = req.headers['authorization'] ?? req.query.token;
    if (token !== process.env.ADMIN_TOKEN) return res.status(401).send(responseHandler.errorJson({
        message: 'Unauthorized'
    }));
    next();
});

router.get('/login', async (req, res) => {
    try {
        const adminAuthUrl = await generateAdminGoogleAuthUrl();
        //redirect to adminAuthUrl
        res.redirect(adminAuthUrl);
    }
    catch (err) {
        res.status(500).send(`Error: ${err}`);
    }
})

router.get('/login/callback', async (req, res) => {
    try {
        const code = req.query.code as string;
        if (!code) throw new Error('No code provided');
        const token = await saveAccessToken(code);
        res.send(`
        <h1>Success!</h1>
        <p>Token: ${token}</p>
        `)
    }
    catch (err) {
        res.status(500).send(`Error: ${err}`);
    }
})

export default router;