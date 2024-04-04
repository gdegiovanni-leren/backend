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


    recoveryRequest = async(req,res) => {
        console.log('pd ecovery request')
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
        console.log('pd ecovery')
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
        console.log('update passwrod')
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