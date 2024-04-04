import CartModel from './models/cart.js'

export default class cartDAO {

    create = async () => { return await CartModel.create({}) }

    findById = async cid => { return await CartModel.findById(cid).lean().exec() }

    findOneById = async cid => { return await CartModel.findOne({_id: cid}).exec() }

    update = async (cid,cart) => { await CartModel.updateOne({_id: cid }, cart ) }


}