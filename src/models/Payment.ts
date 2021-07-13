import {Model} from "../Apps/Model";

export default class Payment extends Model {
  public schema: string = 'GEC_ORDER';
  public table: string = 'payments';
  public keyType: string = 'ai';
  public keyName: string = 'payment_idx';

  public hex_fields: string [] = [
    'order_id'
  ];

  constructor(connection?: any) {
    super(connection)
  }
}
