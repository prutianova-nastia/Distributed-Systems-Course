import Session from '../../models/session';
import config from '../../config';
import createTokens from '../../utils/createToken';
import User from '../../models/user';
import { invalidTokenResponse } from '../../utils/responses';

export default async (request, response) => {
    const session = await Session.findOne({
        refreshToken: request.body.refresh,
        refreshTokenExpireAt: {
            $gte: Date.now()
        }
    });
    if(!session) {
        invalidTokenResponse(response, 'refresh');
    }
    // @ts-ignore
    const userId = session.userId;
    // @ts-ignore
    const user = await User.findOne({ _id: session.userId });
    // @ts-ignore
    const tokens = createTokens(session.userId, user.email);
    await session.remove();
    Session.create({
        refreshToken: tokens.refreshToken,
        refreshTokenExpireAt: Date.now() + config.auth.refreshTokenExpiration,
        // @ts-ignore
        userId: session.userId
    });
    response.send({
        access: tokens.accessToken,
        refresh: tokens.refreshToken
    });
}