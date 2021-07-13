import {Model} from "../Apps/Model";

export default class OrderProduct extends Model {
  public schema: string = 'GEC_ORDER';
  public table: string = 'order_products';
  public keyType: string = 'ai';
  public keyName: string = 'item_idx';

  public hex_fields: string[] = [
    'order_id',
    'product_id',
    'option_id'
  ];

  constructor(connection?: any) {
    super(connection);
  }

}
