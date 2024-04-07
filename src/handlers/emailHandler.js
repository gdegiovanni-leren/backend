
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
            '<h2>YOUR RECOVERY CODE:</h2><br>'+
            '<p><strong>'+recovery_code+'<strong></p><br><br>'+
            '<p><strong>If you did not request password recovery please ignore this email or contact with myshoemarket.securesupport@myshoemarket.com<strong></p><br>'+
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

export const sendProductDeletedEmail = async(email,product_name) => {

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