import {Model} from "../Apps/Model";

export default class ProductReviewImage extends Model {
  public schema: string = 'GEC';
  public table: string = 'product_review_images';
  public keyName: string = 'product_review_image_idx';
  public keyType: string = 'ai';

  constructor(connection?: any) {
    super();
  }
}
