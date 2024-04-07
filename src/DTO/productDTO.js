
export default class productDTO {


    constructor(product,thumbnails,user){
        this.title = product.title.trim(),
        this.description = product.description.trim(),
        this.code = product.code,
        this.price = parseFloat(product.price),
        this.status = true, //true por default
        this.stock = parseInt(product.stock),
        this.category = product.category.trim(),
        this.thumbnails = thumbnails
        this.owner = (user.role == 'premium' ? 'premium' : 'admin')
        this.owner_id = user._id
    }

}