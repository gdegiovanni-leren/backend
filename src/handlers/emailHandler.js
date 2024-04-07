
import config from '../config/config.js'
import nodemailer from 'nodemailer'

export const sendRecoveryPasswordEmail = async(email,recovery_code) => {
    console.log('email send recovery password to ',email)

    try{
        const transport = nodemailer.createTransport({
            service: 'gmail',
            port: 587,
            auth: {
                user: config.nodemailer_user,
                pass: config.nodemailer_pass
            }
        })
        await transport.sendMail({
            from: config.nodemailer_user,
            to: email,
            subject: 'Recovery CODE for SHOES MARKET',
            html: '<div>'+
            '<h3>YOUR RECOVERY CODE:</h3><br>'+
            '<h1><strong>'+recovery_code+'<strong></h1><br>'+
            '<p><strong>If you did not request password recovery please ignore this email or contact with myshoemarket.securesupport@myshoemarket.com<strong> .</p><br>'+
            '<p>Thanks!</p><br>'+
            '<p>SHOES MARKET Support</p><br>'+
            '</div>'
        })
        return true
    }catch(e){
        console.log('Unknown error sending recovery password email..',e)
        return false
    }
}

export const sendDeletedUserEmail = async(email) => {

    console.log('email send delete user to ',email)

    try{
        const transport = nodemailer.createTransport({
            service: 'gmail',
            port: 587,
            auth: {
                user: config.nodemailer_user,
                pass: config.nodemailer_pass
            }
        })
        //USE AWAIT ON THIS?
        await transport.sendMail({
            from: config.nodemailer_user,
            to: email,
            subject: 'SHOES MARKET STORE INFO',
            html: '<div>'+
            '<h2><strong>YOUR ACCOUNT WAS DELETED</strong></h2>'+
            '<p><strong>Please Register again o contact to myshoemarket.infosupport@myshoemarket.com to get more information<strong></p><br><br>'+
            '<p>Thanks!</p><br>'+
            '<p>SHOES MARKET Support</p><br>'+
            '</div>'
        })
        return true
    }catch(e){
        console.log('Unknown error sending recovery password email..',e)
        return false
    }
}

export const sendProductDeletedEmail = async (email,product_name) => {

    console.log('email send product deleted to ',email)

    try{
        const transport = nodemailer.createTransport({
            service: 'gmail',
            port: 587,
            auth: {
                user: config.nodemailer_user,
                pass: config.nodemailer_pass
            }
        })
        //USE AWAIT ON THIS?
        await transport.sendMail({
            from: config.nodemailer_user,
            to: email,
            subject: 'SHOES MARKET STORE INFO',
            html: '<div>'+
            '<h2><strong>YOU PRODUCT -- '+product_name+' -- was deleted </strong></h2>'+
            '<p><strong>Please contact to myshoemarket.infosupport@myshoemarket.com to get more information<strong></p><br><br>'+
            '<p>Thanks!</p><br>'+
            '<p>SHOES MARKET Support</p><br>'+
            '</div>'
        })
        return true
    }catch(e){
        console.log('Unknown error sending product delete email..',e)
        return false
    }
}


export const sendPurchaseEmail = async (data,products,owner) => {

    console.log('email purchase send to ',owner.username)
    console.log('products',products)
    try{
        const transport = nodemailer.createTransport({
            service: 'gmail',
            port: 587,
            auth: {
                user: config.nodemailer_user,
                pass: config.nodemailer_pass
            }
        })


     /*
<table>
  <tr>
    <th>Company</th>
    <th>Contact</th>
    <th>Country</th>
  </tr>
  <tr>
    <td>Laughing Bacchus Winecellars</td>
    <td>Yoshi Tannamuri</td>
    <td>Canada</td>
  </tr>
  <tr>
    <td>Magazzini Alimentari Riuniti</td>
    <td>Giovanni Rovelli</td>
    <td>Italy</td>
  </tr>
</table>
*/
       let header = '<tr><th>Title</th><th>Unit Price</th><th>Quantity</th></tr>'
       let body = ''
       for(let product of products){
          let row = ''
          row = '<tr><td>'+product.title+'</td><td>'+product.price+'</td><td>'+product.quantity+'</td></tr>'
          body = body+''+row
       }

       let table = '<table>'+''+header+''+body+''+'</table>'

       console.log('result table')
       console.log(table)

       let body_message = ''
       if(data.operation_status == 'complete'){
            body_message = 'Below we show you the details of your purchase. If you have any questions, you can contact support at +3393939322 and we will provide you with immediate attention.'
        }else{
            body_message = 'Below are the details of your purchase. We regret that you were not able to purchase all the products, but we will notify you immediately that we have stock!. You can contact support at +3393939322 and we will provide you with immediate attention.'
        }
        await transport.sendMail({
            from: config.nodemailer_user,
            to: owner.username,
            subject: 'Your purchase details from MY SHOES MARKET',
            html: '<div>'+
            '<h2>HI <strong>'+owner.username+'</strong>. Thanks you for your purchase at <strong>MY SHOES MARKET</strong></h2>'+
            '<p>'+body_message+'</p>'+
             table+
            '<p> Total: <strong> $'+String(data.amount)+'</strong> </p></br>'+
            '<p> Ticket code: <strong> $'+data.code+'</strong> </p></br>'+
            '<p>Thanks for trusting us!</p></br><br>'+
            '<h2>MY SHOES MARKET</h2>'+
            '</div>'
            })
            return true
    }catch(e){
        console.log('Unknown error sending purchase email..',e)
        return false
    }



}