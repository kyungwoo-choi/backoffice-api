import {Model} from "../Apps/Model";

import OptionKey from "./OptionKey";

export default class Option extends Model {
  public keyName: string = 'option_id';
  public keyType: string = 'uuid';
  public schema: string = 'GEC';
  public table: string = 'product_options';

  public hex_fields: string[] = [
    'product_id'
  ];

  constructor(connection: any | null) {
    super(connection)
  }

  async create(product_id: any, optionData: any): Promise<any> {
    await this.getConnection();

    // 옵션 키 처리
    for (const sequence in optionData.keys) {
      const optionKey = new OptionKey(this.connection);
      if (!optionData.keys.hasOwnProperty(sequence)) {
        continue;
      }

      const optionKeyData = optionData.keys[sequence];

      optionKey.fields.product_id = product_id;
      optionKey.fields.key_idx = optionKeyData.key_idx;
      optionKey.fields.sequence = +sequence + 1;
      optionKey.fields.name = optionKeyData.name;
      optionKey.fields.display_name = optionKeyData.display_name || optionKeyData.name;
      optionKey.fields.name = optionKeyData.name;

      await optionKey.save()
    }

    const optionKeyLength = optionData.keys.length;

    //  옵션정보 처리
    for (const optionInfo of optionData.groups) {
      // if (optionInfo.values.length !== optionKeyLength) {
      //   throw {
      //     message: '옵션키의 갯수만큼 옵션을 생성해야합니다.'
      //   }
      // }

      await this.generateKey();
      this.fields.product_id = product_id;
      // let sequence = 1;
      // for (const option of optionInfo.values) {
      //   this.fields[`option_${sequence}`] = option;
      //   sequence++;
      // }
      this.fields.option_id = optionInfo.option_id;
      this.fields.option_1 = optionInfo.option_1;
      this.fields.option_2 = optionInfo.option_2;
      this.fields.option_3 = optionInfo.option_3;
      this.fields.option_4 = optionInfo.option_4;
      this.fields.option_5 = optionInfo.option_5;
      this.fields.add_price = optionInfo.addPrice | 0;
      this.fields.stock = optionInfo.stock;

      await this.save()
    }
  }
}
