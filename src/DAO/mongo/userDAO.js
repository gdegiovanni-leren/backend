import UserModel from './models/user.js'

export default class userDAO {

    getAllUsers = async () => { return await UserModel.find() }

    findOne = async username => { return await UserModel.findOne({username}) }

    findById = async id => {  return await UserModel.findById(id) }

    create = async user => { return await UserModel.create(user) }

    update = async user => { return await user.save() }

    deleteOne = async id => { return await UserModel.deleteOne({ _id: id }) }

}