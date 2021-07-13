import {Model} from "../Apps/Model";

export default class OptionKey extends Model {
  public keyType: string = 'ai';
  public keyName: string = 'key_idx';
  public schema: string = 'GEC';
  public table: string = 'product_option_keys';

  public hex_fields: string[] = [
    'product_id'
  ];

  constructor(connection: any | null) {
    super(connection);
  }
}
