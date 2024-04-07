
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import config from '../config/config.js'
import userDTO from '../DTO/userDTO.js'
import { sendRecoveryPasswordEmail , sendDeletedUserEmail } from '../handlers/emailHandler.js'


class UserService {

    constructor(dao){
      console.log('User Service initialization')
      this.userDAO = dao
    }


    register = async (username, password, confirmPassword ) => {

        console.log('calling register in user service')
        try{
            let user = await this.userDAO.findOne(username)

            if(user) return { isvalid: false , status : 400, message: "Username already exist"}
            if(password !== confirmPassword) return { isvalid: false, status: 400, message: "Passwords do not match"}

            const salt = await bcrypt.genSalt(10)
            const hashedPassword = await bcrypt.hash(password, salt)
            user = {
                username,
                password: hashedPassword,
                role: await this.getRole(username,password),
                last_connection : new Date()
            };
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
            const token = jwt.sign({id: user._id, username: user.username, role : user.role}, config.jwt_secret_key, {expiresIn: "30m"} )

            user.last_connection = new Date()
            await this.userDAO.update(user)

            return { isvalid : true, message: token, username: username, role: user.role }

        }catch(e){
            console.log(e)
            return { isvalid: false, status: 500, message: 'Unknown error in login user' }
        }
    }


    logout = async (username) => {

        console.log('calling logout in user service')
        try{
            let user = await this.userDAO.findOne(username)
            if(!user){
            return { isvalid : false, status : 400 , message: "Invalid user" }
            }
            user.last_connection = new Date()
            await this.userDAO.update(user)

            return { isvalid : true, status: 200, message: 'OK' , username : username }

        }catch(e){
            console.error(e)
            return { isvalid: false, status: 500, message: 'Unknown error in logout user' }
        }
    }

    getUserById = async (uid) => {
        try{
          return await this.userDAO.findById(uid)
        }catch(e){
            console.error(e)
          return null
        }
    }

    getUserByUsername = async (username) => {
        console.log('get user by username ',username)
        try{
          return await this.userDAO.findOne(username)
        }catch(e){
            console.error(e)
          return null
        }
    }


    getAllUsers = async () => {

        try{
            let payload = Array()
            let users = await this.userDAO.getAllUsers()

            if(!users) return { isvalid : false, status : 400 , data: null, message: "No users found" }

            //get only parsed user without sensible data for admin view update (role & others)
            for( let user of users){
              if(user.role != 'admin'){
                payload.push( new userDTO(user).getUserForAdmin() )
              }
            }
            return { isvalid : true, status : 200 , data : payload , message: 'OK'}

        }catch(e){
            console.error(e)
            return { isvalid: false, status: 500, data: null,  message: 'Unknown error in getting users, try again later.' }
        }
    }


    getProfileData = async ( username ) => {
        try{
            let user = await this.userDAO.findOne(username)
            if(!user) return { isvalid : false, status : 400 , data: null, message: "No user found" }

            return  { isvalid : true, status : 200 , data : new userDTO(user).getProfileData(), message: "OK" }

        }catch(e){
            console.error(e)
            return { isvalid: false, status: 500, data: null,  message: 'Unknown error in get profile data, try again later.' }
        }
    }

    updateUser = async (uid, profile_name, role) => {

        try{
            let user = await this.userDAO.findById(uid)
            if(!user) return { isvalid : false, status : 400 , message: "No user found" }
            if(user.role == 'admin') return { isvalid : false, status : 405 , message: "You cannot update yourself!" }

            user.profile_name = profile_name
            user.role = role
            await this.userDAO.update(user)

            return  { isvalid : true, status : 200 , message: " User updated succesfully!" }

        }catch(e){
            console.error(e)
            return { isvalid: false, status: 500, data : null,  message: 'Unknown error in update user, try again later.' }
        }
    }


    deleteAllUsers = async () => {
        try{
            let users = await this.userDAO.getAllUsers()

            if(!users) return { isvalid : false, status : 400 , data: null, message: "No users found to delete" }

            let count = 0
            //verifing date an delete
            for( let user of users){
              if(user.role != 'admin'){
                console.log('user last connection ',user.last_connection)
                //verify expires date connection
                const now = new Date()
                const last_connection = user.last_connection

                if(last_connection){
                /* FOR TESTING PROPOUSALS, DELETE ALL USERS WITH 30 MINUTES OF INACTIVITY*/

                //diff in miliseconds
                let diff = (now - last_connection)
                diff = (diff / 1000) / 60
                console.log('DIF',diff)
                    if(parseInt(diff) > 30){
                        //EXIPRED DATE: delete user
                        const email = user.username
                        //delete
                        await this.userDAO.deleteOne(user._id)
                    //SEND EMAIL ASYNC
                    sendDeletedUserEmail(email)
                    count++
                    }
                }
              }
            }
        return { isvalid: true, status: 200,  message: 'Operation success. '+count+' users deleted.' }

        }catch(e){
            console.log(e)
            return { isvalid: false, status: 500,  message: 'Unknown error trying to delete all users, try again later.' }
        }
    }


    deleteUser = async (uid) => {
        try{
            let user = await this.userDAO.findById(uid)

            if(!user) return { isvalid : false, status : 400, message: "No users found to delete" }
            if(user.role == 'admin') return { isvalid : false, status : 400, message: "You dont have permission to delete yourself!" }

            const email = user.username
            await this.userDAO.deleteOne(user._id)
            //SEND EMAIL ASYNC
            sendDeletedUserEmail(email)

            return { isvalid: true, status: 200, message: 'Operation success. User deleted' }
        }catch(e){
            console.log(e)
            return { isvalid: false, status: 500, message: 'Unknown error trying to delete user, try again later.' }
        }
    }


    updateProfileData = async (username, profile_name, profile_address, profile_phone, file) => {

        try{
            let user = await this.userDAO.findOne(username)
            if(!user) return { isvalid : false, status : 400 , data : null, message: "No user found" }

            let url = `${config.base_url}assets/profiles/${file?.filename}`
            ///fix wired error production
            const profile_url = url.replace("=", "")

            user.profile_name = profile_name
            user.profile_address = profile_address
            user.profile_phone = profile_phone
            user.profile_picture = file?.filename ? profile_url : null
            await this.userDAO.update(user)

            return  { isvalid : true, status : 200 , data: user.profile_picture , message: "Profile updated succesfully!" }
        }catch(e){
            console.error(e)
            return { isvalid: false, status: 500, data : null,  message: 'Unknown error in update profile, try again later.' }
        }
    }


    uploadDocuments = async (username,identification_file,address_file,status_account_file) => {

        try{
            let user = await this.userDAO.findOne(username)
            if(!user) return { isvalid : false, status : 400 , message: "No user found" }

            if(identification_file) user.identification_file = identification_file.filename ? config.base_url+'assets/documents/'+identification_file.filename : null
            if(address_file) user.address_file = address_file.filename ? config.base_url+'assets/documents/'+address_file.filename : null
            if(status_account_file) user.status_account_file = status_account_file.filename ? config.base_url+'assets/documents/'+status_account_file.filename : null

             //check if already exists documents for this user and the new ones
             if(user.identification_file && user.address_file && user.status_account_file){
                //if exists, then change flag for all documentation uploaded
                user.documents_status = true
            }
            //last step: save user
            await this.userDAO.update(user)

            return  { isvalid : true, status : 200 , message: "Documents saved succesfully!" }
        }catch(e){
            console.log(e)
            return { isvalid: false, status: 500 ,  message: 'Unknown error saving documents, try again later.' }
        }
    }


    updatePremiumMembrecy = async (username) => {

        console.log('Update premium user membrecy')
        try{
            let user = await this.userDAO.findOne(username)
            if(!user) return { isvalid : false, status : 400 , message: "No user found" }

            if(user.documents_status == false) return { isvalid : false, status : 400 , message: "You need to upload all documentation to become a premium user." }

            //if all documentaton was uploaded, update role
            user.role = 'premium'
            await this.userDAO.update(user)
            //send ok
            return { isValid: true, status: 200, message : "Congrats! you are now a Premium User. Please login again to see all your benefits"}

        }catch(e){
            console.log(e)
            return { isvalid: false , status : 500, message: "Unknown error updating user premium membrecy "}
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

                //diff in miliseconds
                let diff = (now - expire_at)
                diff = (diff / 1000) / 60
                // if past 30 minutes....
                if(parseInt(diff) >= 30){
                    //EXIPRED DATE
                    user.recovery_expires_at = null
                    user.recovery_sended = false
                    user.recovery_code = null
                    user.recovery_token = null
                    await this.userDAO.update(user)
                    return { isvalid : false, status : 410 , message: "Expired code. Please recovery again." }
                }
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

            const result = await sendRecoveryPasswordEmail(username,recovery_code)
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
            if(user.recovery_token != recovery_token){
                return { isvalid : false, status : 400 , message: "Ups. something went wrong. Try again" }
            }
            const isMatch = await bcrypt.compare(new_password, user.password)
            if (isMatch) {
            return{ isvalid : false , status: 400, message: "The password must be different" }
            }

            const salt = await bcrypt.genSalt(10)
            const hashedPassword = await bcrypt.hash(new_password, salt)
            user.password = hashedPassword
            user.recovery_code = null
            user.recovery_token = null
            user.recovery_sended = false
            user.recovery_expires_at = null
            await this.userDAO.update(user)

            return{  isvalid : true , status:  200 , message: "Your password was updated successfully!" }

        }catch(e){
            console.log(e)
            return { isvalid: false, status: 500, message: 'Unknown error in password update, try again later.' }
        }
    }


    getRole = async (username,password) => {
        if(config.admin_email === username && config.admin_password === password ){
           return 'admin'
        }
        return 'user'
    }


}

export default UserService
