import {Model} from "../Apps/Model";
import UserInquiryImage from "./UserInquiryImage";

export default class UserInquiry extends Model {
  public schema: string = 'GEC';
  public table: string = 'user_inquiries';
  public keyName: string = 'inquiry_idx';
  public keyType: string = 'ai';

  public hex_fields:string[] = [
    'user_id'
  ];

  constructor(connection?: any) {
    super(connection);
  }

  public inquiry_images = async () => {
    return this.hasMany(UserInquiryImage, 'inquiry_idx', 'inquiry_idx', 'inquiry_images');
  }
}
