
import config from '../config/config.js'
import nodemailer from 'nodemailer'

export const sendRecoveryPasswordEmail = async(email,recovery_code) => {
    console.log('email received in email handler?',email,recovery_code)


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
            from: 'gergiovanni@gmail.com',
            to: email,
            subject: 'Recovery password for MY SHOES MARKET',
            html: '<div>'+
            '<h2><strong>Please, put the received code in the recovery...</strong></h2>'+
            '<p><strong>'+recovery_code+'<strong></p>'+
            '<p><strong>If you dont recovery password please ingnore this email<strong></p>'+
            '</div>',
        })
        return true
    }catch(e){
        console.log('Unknown error sending recovery password email..',e)
    }

    return false

}