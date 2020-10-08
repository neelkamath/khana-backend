import expressJwt from 'express-jwt';
import {Role} from './api-models';
import jwt from 'jsonwebtoken';

export const jwtHandler = expressJwt({secret: process.env.JWT_SECRET!, algorithms: ['HS256']});

/**
 * @param userId The `_id` field of the user in the MongoDB doc.
 * @param role The user's permission level.
 */
export function buildAccessToken(userId: string, role: Role): string {
    return jwt.sign({userId, role}, process.env.JWT_SECRET!, {expiresIn: '1h'});
}