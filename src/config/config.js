import dotenv from 'dotenv'

dotenv.config()

export default {
    persistence: process.env.PERSISTENCE,
    port: process.env.PORT || 8080,
    base_url : process.env.BASE_URL,
    mongoURL: process.env.MONGO_URL,
    jwt_secret_key : process.env.JWT_SECRET_KEY,
    admin_email: process.env.ADMIN_EMAIL,
    admin_password: process.env.ADMIN_PASSWORD,
    purchaser_email_test: process.env.PURCHASER_TEST,
    nodemailer_user : process.env.NODEMAILER_USER,
    nodemailer_pass: process.env.NODEMAILER_PASSWORD,
    mercadopago_access_token : process.env.MERCADOPAGO_ACCESS_TOKEN
}