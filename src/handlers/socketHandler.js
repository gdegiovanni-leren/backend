import { productService } from '../services/indexService.js'

export const addComment = async (data) => {

    const { product_id , comment , username } = data

    if(!product_id || !username || !comment){
        console.log('returning false in add comment handler')
        return false
    }

    const productExists = await productService.productExists(product_id)

    if(!productExists){
        console.log('not product exists in add add comment handler')
        return false

    }

    const result = await productService.addNewComment(product_id,comment,username)
    return result

}

export const getComments = async product_id => {
    return await productService.getComments(product_id)
}