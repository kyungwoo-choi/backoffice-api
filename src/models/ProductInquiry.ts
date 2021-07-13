import {Model} from "../Apps/Model";

export default class ProductInquiry extends Model {
  public schema: string = 'GEC';
  public table: string = 'product_inquiries';
  public keyName: string = 'product_inquiry_idx';
  public keyType: string = 'ai';

  public hex_fields:string[] = [
    'product_id',
    'user_id'
  ];

  constructor(connection?: any) {
    super(connection);
  }
}
