import { userService } from '../services/indexService.js'

class UserController {

    constructor(){}

    register = async(req, res) => {

            const {username, password, confirmPassword} = req.body
            const result = await userService.register(username,password,confirmPassword)
            if(result.isvalid){
                return res.status(200).json({username : result.username, token : result.token, role: result.role})
            }else{
                return res.status(result.status).json({message: result.message})
            }
    }

    login = async(req,res) => {

        const {username, password} = req.body
        const result = await userService.login(username,password)
        if(result.isvalid){
            return res.status(200).json({message: result.message, username : result.username , role : result.role })
        }else{
             return res.status(result.status).json({ message: result.message })
        }
    }

    logout = async(req,res) => {

        const { username } = req.body
        const result = await userService.logout(username)
        if(result.isvalid){
            return res.status(200).json({message: result.message, username : result.username  })
        }else{
             return res.status(result.status).json({ message: result.message })
        }
    }


    getUsers = async (req,res) => {

        console.log('get all users')
        const user = req.user
        if(!user) return res.status(404).json({ data: null, message: 'Invalid user' })

        const result = await userService.getAllUsers()

        return res.status(200).json(result)
    }

    updateUser = async(req,res) => {

        const { uid } = req.params
        const {  profile_name , role  } = req.body

        console.log(uid,profile_name,role)
        const result = await userService.updateUser(uid,profile_name,role)
        if(result.isvalid)  return res.status(200).json(result)

        return res.status(result.status).json(result)
    }


    getProfileData = async(req,res) => {

        const { username } = req.query
        console.log('get profile data',username)
        if(!username)  return res.status(404).json({ data: null, message: 'Invalid user' })

        const result = await userService.getProfileData(username)
        if(result.isvalid)  return res.status(200).json(result)

        return res.status(result.status).json(result)
    }

    updateProfileData = async (req, res) => {

        const { id , username , profile_name , profile_address , profile_phone  } = req.body
        const file = req.file

        console.log('upload profile data in controller',id,username,profile_name,profile_address,profile_phone)

        if(!username)  return res.status(404).json({ status: false, message: 'Invalid user' })

        const result = await userService.updateProfileData(username,profile_name,profile_address,profile_phone,file)

        if(result.isvalid){
            return res.status(200).json(result)
        }else{
            return res.status(result.status).json(result)
        }
    }

    deleteAllUsers = async (req,res) => {

        const result = await userService.deleteAllUsers()

        if(result.isvalid){
            return res.status(200).json(result)
        }else{
            return res.status(result.status).json(result)
        }
    }

    deleteUser = async (req,res) => {

        const { uid } = req.params

        if(!uid) return res.status(404).json({ isvalid: false, status: 404, message: 'Invalid user' })

        const result = await userService.deleteUser(uid)

        if(result.isvalid){
            return res.status(200).json(result)
        }else{
            return res.status(result.status).json(result)
        }

    }

    uploadDocuments = async (req, res) => {

        const {  username } = req.body
        const identification_file = req.files?.identification_file ? req.files.identification_file[0] : null
        const address_file = req.files?.address_file ? req.files.address_file[0] : null
        const status_account_file = req.files?.status_account_file ? req.files.status_account_file[0] : null

        if(!identification_file && !address_file && !status_account_file ) return res.status(405).json({ status: false, message: 'Error uploading documents.' })

        const result = await userService.uploadDocuments(username,identification_file,address_file,status_account_file)

        if(result.isvalid){
            return res.status(200).json(result)
        }else{
            return res.status(result.status).json(result)
        }


    }


    updatePremiumMembrecy = async (req, res) => {

        const user = req.user
        console.log(user)

        if(!user || user.role != 'user') return res.status(405).json({isValid: false, status: 405 , message: 'You dont have permissons to do this action'})

        const result = await userService.updatePremiumMembrecy(user.username)

        if(result.isvalid){
            return res.status(200).json({message: 'OK?'})
        }else{
            return res.status(result.status).json(result)
        }




    }


    recoveryRequest = async(req,res) => {
        const { username , recovery_code } = req.body
        console.log(username,recovery_code)

        const result = await userService.processRecoveryRequest(username,recovery_code)

        if(result.isvalid){
            return res.status(200).json({ message : 'Input your new password' , recovery_token : result.recovery_token })
      }else{
           return res.status(result.status).json({ message: result.message })
      }
    }


    passwordRecovery = async(req,res) => {
        const {email } = req.body
        console.log(email)

        const result = await userService.passwordRecovery(email)
        console.log(result)

        if(result.isvalid){
              return res.status(200).json({message: result.message })
        }else{
             return res.status(result.status).json({ message: result.message })
        }
    }

    updatePassword = async(req,res) => {
        console.log('update password call')
        const { username , new_password , recovery_token } = req.body

        console.log(username,new_password,recovery_token)

        const result = await userService.updatePassword(username,new_password,recovery_token)

        if(result.isvalid){
            return res.status(200).json({message: result.message})
        }

       return  res.status(result.status).json({ message: result.message })
    }

}


export default UserController