
import jwt from 'jsonwebtoken'
import config from '../config/config.js'


export async function auth(req, res, next){

    const authHeader = await req.headers.authorization || req.headers.Authorization;
    //console.log('auth header found ?',authHeader)
    const token = await authHeader && authHeader.split(" ")[1];
    console.log('auth call, token? ',token ? 'yes' : 'no')

    if (!token) return res.status(403).json({ error: 'Missing authorization header' });

      jwt.verify(token, config.jwt_secret_key, (err, user) => {
        if (err) {
          console.log('invalid o expirred')
          return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user
        next()
      });
    }


 export const  authorization =  roles => {

  return async (req, res, next ) => {

    const user = await req.user
    if(!user) return res.status(401).json({ error: 'Unauthorized '})
    if(!roles.includes(user.role)) return res.status(401).json({ error: 'Unauthorized'})

    return next()
  }

 }
