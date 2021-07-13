import {Model} from "../Apps/Model";
import OrderProduct from "./OrderProduct";

export default class Order extends Model {
  public schema: string = 'GEC_ORDER';
  public table: string = 'prepare_orders';
  public keyName: string = 'order_id';
  public keyType: string = 'uuid';

  public hex_fields: string[] = [
    'user_id'
  ];

  constructor(connection?: any) {
    super(connection);
  }

  async orderProducts() {
    return this.hasMany(OrderProduct, 'order_id', 'order_id', 'order_products');
  }
}
