import {Model} from "../Apps/Model";

export default class PromotionBrand extends Model {
  public schema: string = 'gec_promotion';
  public table: string = 'promotion_brands';
  public keyName: string = 'promotion_brand_idx';
  public keyType: string = 'ai';

  public hex_fields: string[] = [];

  constructor(connection?: any) {
    super(connection);
  }
}
