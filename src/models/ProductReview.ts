import {Model} from "../Apps/Model";
import ProductReviewImage from "./ProductReviewImage";

export default class ProductReview extends Model {
  public schema: string = 'GEC';
  public table: string = 'product_reviews';
  public keyName: string = 'product_review_idx';
  public keyType: string = 'ai';

  public hex_fields: string[] = [
    'product_id',
    'user_id'
  ];

  constructor(connection?: any) {
    super();
  }

  public async images(): Promise<any> {
    return this.hasMany(ProductReviewImage, 'product_review_idx', 'product_review_idx', 'images');
  }
}
