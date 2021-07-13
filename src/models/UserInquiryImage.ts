import {Model} from "../Apps/Model";

export default class UserInquiryImage extends Model {
  public schema: string = 'GEC';
  public table: string = 'user_inquiry_images';
  public keyName: string = 'inquiry_image_idx';
  public keyType: string = 'ai';

  constructor(connection?: any) {
    super(connection);

  }

}
