import {Model} from "../Apps/Model";

export default class PromotionCategory extends Model {
  public schema: string = 'gec_promotion';
  public table: string = 'promotion_categories';
  public keyName: string = 'promotion_category_idx';
  public keyType: string = 'ai';

  public hex_fields: string[] = [];

  constructor(connection?: any) {
    super(connection);
  }

}
