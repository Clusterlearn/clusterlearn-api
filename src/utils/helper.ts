import { avaliablePlatform } from '@/types/modelData';
import bcrypt from 'bcrypt';
import redisClient from '@/services/redis';
import { Request } from 'express';

export function hashPassword(password: string, saltRounds = 10){
    const salt =  bcrypt.genSaltSync(saltRounds);
    const hash =  bcrypt.hashSync(password, salt);
    return hash;
}

export async function verifyPassword(password: string , hash: string)
{
    return bcrypt.compareSync(password, hash)
}


export function getPlatformHost(url: string): avaliablePlatform
{
    const parsedUrl = new URL(url);
    const host = parsedUrl.host.replace('www.', '')
    // remove any subdomain and get only the main domain
    const hostParts = host.split('.')
    if (hostParts.length > 2) hostParts.shift()
    return hostParts.join('.') as avaliablePlatform
}

export function generateRandomString(length: number = 10) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let str = '';
    for (let i = 0; i < length; i++) {
        str += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return str;
}

export async function generateUnRegistrationToken(url: string, email: string, paid: boolean = false) {
    const data = {
        url: url,
        email: email,
        paid: paid
    }
    const maxTries = 12;
    let tries = 0;
    while (true && tries < maxTries) {
        const token = generateRandomString();
        const isSet = await redisClient.get(token);
        if (!isSet) {
            await redisClient.set(token, JSON.stringify(data), 'EX', 60 * 60 * 24 * 7);
            return token;
        }
        tries++;
    }

}

export async function getUnRegistrationData(token: string) : Promise<{url: string, email: string, paid: boolean} | null> {
    const data = await redisClient.get(token)
    if (!data) return null;
    return JSON.parse(data);
}

export async function deleteUnRegistrationToken(token: string) {
    await redisClient.del(token)
}

export function setBaseURL(req: Request) {
    const protocol = req.protocol;
    const host = req.hostname
    const port = req.socket.localPort
    const BASE_URL = `${protocol}://${host}${port == 80 || port == 443 || port == undefined ? '' : `:${port}`}`
    process.env.BASE_URL = BASE_URL
}