import {Model} from "../Apps/Model";

export default class ProductImage extends Model {
  public keyName: string = 'image_idx';
  public keyType: string = 'ai';
  public schema: string = 'GEC';
  public table: string = 'product_images';

  public hex_fields: string [] = [
    'product_id'
  ];

  constructor(connection: any | null) {
    super(connection);
  }
}
