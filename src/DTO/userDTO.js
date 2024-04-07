
export default class userDTO {


    constructor(user){
        this._id = user._id
        this.username = user.username
        this.role = user.role
        this.profile_name = user.profile_name
        this.profile_address = user.profile_address
        this.profile_phone = user.profile_phone
        this.profile_picture = user.profile_picture
    }

    // for profile user (user,premium & admin)
    getProfileData = () => {
         const user = {
            "uid" : this._id.toString(),
            "username" : this.username,
            "role" : this.role,
            "profile_name" : this.profile_name,
            "profile_address" : this.profile_address,
            "profile_phone": this.profile_phone,
            "profile_picture" : this.profile_picture
        }
        return user
    }

    //for admin user only
    getUserForAdmin = () => {
        const user = {
            "uid" : this._id.toString(),
            "username" : this.username,
            "role" : this.role,
            "profile_name" : this.profile_name,
        }
        return user

    }

}