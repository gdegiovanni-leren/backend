
import { ProductDAO } from '../DAO/factory.js'
import { CartDAO } from '../DAO/factory.js'
import { TicketDAO } from '../DAO/factory.js'
import { UserDAO } from '../DAO/factory.js'

import ProductService from './productService.js'
import CartService from './cartService.js'
import TicketService from './ticketService.js'
import UserService from './userService.js'

export const productService = new ProductService(new ProductDAO())
export const cartService = new CartService(new CartDAO())
export const ticketService = new TicketService(new TicketDAO())
export const userService = new UserService(new UserDAO())