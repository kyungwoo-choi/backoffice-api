import {Model} from "../Apps/Model";

export default class PromotionProduct extends Model {
  public schema: string = 'gec_promotion';
  public table: string = 'promotion_targets';
  public keyName: string = 'promotion_target_idx';
  public keyType: string = 'ai';

  public hex_fields: string[] = [
    'promotion_product_id'
  ];

  constructor(connection?: any) {
    super(connection);
  }
}
