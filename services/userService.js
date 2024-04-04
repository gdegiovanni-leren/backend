
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import config from '../config/config.js'
import { sendRecoveryPasswordEmail } from '../handlers/emailHandler.js'

class UserService {

    constructor(dao){
      console.log('User Service initialization')
      this.userDAO = dao
    }

    register = async (username, password, confirmPassword ) => {

        console.log('calling register in user service')
        try{
        let user = await this.userDAO.findOne(username)
        if(user){
            return { isvalid: false , status : 400, message: "Username already exist"}
        }
        if(password !== confirmPassword){
            return { isvalid: false, status: 400, message: "Passwords do not match"}
        }
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)
        user = {username, password: hashedPassword,  role: await this.getRole(username,password) }
        const createdUser =  await this.userDAO.create(user)
        const token = jwt.sign({id: user._id, username: user.username, role: user.role }, config.jwt_secret_key, {expiresIn: "20m"} )

        return { isvalid: true, status: 200, username: user.username, token, role: user.role }

        }catch(e){
            console.log(e)
            return { isvalid: false, status: 500, message: 'Unknown error in registering user '}
        }
    }

    login = async (username, password) => {

        console.log('calling login in user service')
        try{
        let user = await this.userDAO.findOne(username)
        if(!user){
          return { isvalid : false, status : 400 , message: "Invalid user" }
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
          return{ isvalid : false , status: 400, message: "Invalid password" }
        }
        const token = jwt.sign({id: user._id, username: user.username, role : user.role}, config.jwt_secret_key, {expiresIn: "15m"} )
        return { isvalid : true, message: token, username: username, role: user.role }

        }catch(e){
            console.log(e)
            return { isvalid: false, status: 500, message: 'Unknown error in login user' }
        }
    }


    processRecoveryRequest = async (username,recovery_code) => {

        try{
            let user = await this.userDAO.findOne(username)
            if(!user) return { isvalid : false, status : 400 , message: "No user found" }

            //unknown error, recovery code not found in DB
            if(!user.recovery_sended || !user.recovery_code) return { isvalid : false, status : 400 , message: "Recovery process unknown error. Try again later" }

            //recovery expire timeout
            const now = new Date()
            const expire_at = user.recovery_expires_at

            if(!expire_at) return { isvalid : false, status : 400 , message: "Recovery process unknown error. Try again later" }

            console.log('date now',now)
            console.log('expired at',expire_at)
            //diff in miliseconds
            let diff = (now - expire_at)
            diff = (diff / 1000) / 60
            console.log('DIF',diff)
            if(parseInt(diff) > 2){
                //EXIPRED DATE
                user.recovery_expires_at = null
                user.recovery_sended = false
                user.recovery_code = null
                user.recovery_token = null
                await this.userDAO.update(user)
                return { isvalid : false, status : 410 , message: "Expired code. Please recovery again." }
            }


            console.log('recovery code user db',user.recovery_code)
            console.log('recovery code received',recovery_code)

            //recovery code not match
            if(user.recovery_code != recovery_code) return { isvalid : false, status : 400 , message: "Invalid recovery code" }

            //generate new recovery token
            user.recovery_token =  crypto.randomBytes(10).toString('hex')
            await this.userDAO.update(user)

        return { isvalid : true , status: 200, recovery_token: user.recovery_token }

    }catch(e){
        console.log(e)
        return { isvalid: false, status: 500, message: 'Unknown error in password Recovery, try again later.' }
    }

    }


    passwordRecovery = async (username) => {
        try{
            let user = await this.userDAO.findOne(username)
            if(!user){
            return { isvalid : false, status : 400 , message: "No user found with this email" }
            }

            const recovery_code = crypto.randomBytes(5).toString('hex')

            user.recovery_code = recovery_code
            user.recovery_sended = true
            user.recovery_expires_at = new Date()
            user.recovery_token = null
            await this.userDAO.update(user)

            console.log('user updated succesfull,sending recovery....')
            //const result = await sendRecoveryPasswordEmail(username,recovery_code)

            const result = true

            if(result == false)   return{ isvalid : false , status:  401 , message: "Ups, your recovery email could not be sended, plese try again later." }

            return{ isvalid : true , status:  200 , message: "Your password recovery send succesfully, plese put your recovery code" }


    }catch(e){
        console.log(e)
        return { isvalid: false, status: 500, message: 'Unknown error in password Recovery, try again later.' }
    }
    }


    updatePassword = async (username,new_password,recovery_token) => {


        try{
            let user = await this.userDAO.findOne(username)
            if(!user){
            //TODO: RESET PARAMS
            return { isvalid : false, status : 400 , message: "No user found with this email" }
            }

            console.log('recovery token db',user.recovery_token)
            console.log('actual recovery token',recovery_token)
            if(user.recovery_token != recovery_token){
                console.log('recoveries token not match')
                return { isvalid : false, status : 400 , message: "Ups. something went wrong. Try again" }
            }

            const isMatch = await bcrypt.compare(new_password, user.password)
            if (isMatch) {
            return{ isvalid : false , status: 400, message: "The password must be different" }
            }

            console.log('todo ok, updating password')
            const salt = await bcrypt.genSalt(10)
            const hashedPassword = await bcrypt.hash(new_password, salt)
            user.password = hashedPassword
            user.recovery_code = null
            user.recovery_token = null
            user.recovery_sended = false
            user.recovery_expires_at = null
            await this.userDAO.update(user)

            console.log('user password updated succesfull')

            return{  isvalid : true , status:  200 , message: "Your password was updated successfully!" }


    }catch(e){
        console.log(e)
        return { isvalid: false, status: 500, message: 'Unknown error in password update, try again later.' }
    }




    }


    getRole = async (username,password) => {

        console.log('calling register validation role admin')
        if(config.admin_email === username && config.admin_password === password ){
           return 'admin'
        }
        return 'user'
    }


}

export default UserService
