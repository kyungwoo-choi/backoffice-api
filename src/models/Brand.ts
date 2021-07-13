import {Model} from "../Apps/Model";

export default class Brand extends Model {
  public keyName = 'brand_id';
  public keyType = 'ai';
  public schema = 'GEC';
  public table = 'brands';

  constructor(connection?: any) {
    super(connection);
  }
}
