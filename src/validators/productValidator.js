

export const validateFieldsForCreate = (data) => {

    if(!data) return {status : false, message : 'Error: No product data found' }

        const { title , description , code, price , status, stock, category , thumbnails } = data

        if(!title) return {status : false, message : 'The product must have a title' }
        if(!description) return {status : false, message : 'The product must have a description' }
        if(!code) return {status : false, message : 'The product must have a code' }
        if(!price) return {status : false, message : 'The product must have a price' }
        if(status != true && status != false) return {status : false, message : 'The product must have a status and must be true or false' }
        //if(!stock) return {status : false, message : 'El producto debe tener stock' }
        if(!category) return {status : false, message : 'The product must have a category' }
        if(stock < 0 || isNaN(parseInt(stock))) return {status : false, message : 'The stock entered is incorrect' }
        if(isNaN(parseFloat(price))) return {status : false, message : 'The price value is incorrect' }
        if(parseFloat(price) < 0 ) return {status : false, message : 'The price value is incorrect' }
        //if(!Array.isArray(thumbnails)) return {status : false, message : 'Thumbnails must be in array format' }

        return {status : true, message : 'Validation success' }
}


export const validateFieldsForUpdate = (data) => {

    if(!data.title) return {status: false, message: 'the title cannot be empty'}
    if(!data.description) return {status: false, message: 'the description cannot be empty'}
    if(!data.code) return {status: false, message: 'the code cannot be empty'}
    if(!data.price) return {status: false, message: 'the price cannot be empty'}
    //if(!data.stock) return {status: false, message: 'the stock cannot be empty'}
    if(data.stock < 0 || isNaN(parseInt(data.stock))) return {status : false, message : 'The stock entered is incorrect' }
    if(isNaN(parseFloat(data.price))) return {status : false, message : 'The price value is incorrect' }
    if(parseFloat(data.price) < 0 ) return {status : false, message : 'The price value is incorrect' }
    if(!Array.isArray(data.thumbnails)) return {status : false, message : 'Thumbnails must be in array format' }

    return {status : true, message : 'Validation success' }
}
