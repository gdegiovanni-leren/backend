import UserModel from './models/user.js'

export default class userDAO {

    findOne = async username => { return await UserModel.findOne({username}) }

    create = async user => { return await UserModel.create(user) }

    update = async user => { return await user.save() }

}