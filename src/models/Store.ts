import {Model} from '../Apps/Model'

export default class Store extends Model {
  public keyType: string = 'uuid';
  public keyName: string = 'store_id';
  public schema: string = 'GEC';
  public table: string = 'stores';

  constructor(connection: any | null) {
    super(connection);
  }
}
