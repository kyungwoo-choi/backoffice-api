import {Router} from 'express'

import ProductController from './products/ProductsController';
import UserController from './users/UsersController';
import CategoryController from "./categories/CategoryController";
import BrandController from "./brands/BrandController";
import PromotionController from "./promotions/PromotionController";
import PaymentController from "./payment/PaymentController";
import OrderController from "./order/OrderController";
import UserInquiryController from "./user-inquiries/UserInquiryController";
import ProductInquiryController from "./product-inquiries/ProductInquiryController";
import ProductReviewController from "./product-reviews/ProductReviewController";

export default class ApiRouter {
  public router: Router = Router();
  public path: string = '/api';
  public controllers: any[] = [
    ProductController,
    UserController,
    CategoryController,
    BrandController,
    PromotionController,
    PaymentController,
    OrderController,
    UserInquiryController,
    ProductInquiryController,
    ProductReviewController
  ];

  constructor() {
    for (const Controller of this.controllers) {
      const controller = new Controller();
      this.router.use(controller.path, controller.route());
    }
  }
}
