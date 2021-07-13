import {ApiController} from "../../Apps/ApiController";
import ProductReview from "../../models/ProductReview";

export default class ProductReviewController extends ApiController {
  public path: string = '/product-reviews';
  public Model: any = ProductReview;
  public keyName: any = 'product_review_idx';

  constructor() {
    super();
  }
}
