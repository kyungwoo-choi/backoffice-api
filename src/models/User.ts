import {Model} from "../Apps/Model";
import UserInquiry from "./UserInquiry";
import ProductInquiry from "./ProductInquiry";
import ProductReview from "./ProductReview";

// export interface UserInterface extends ModelInterface {
//     user_id: string,
//     password: string,
//     salt: string,
//     email: string,
//     sns: string,
//     name: string,
//     phone_number: string,
//     gender: number,
//     status: string,
//     active_date: string,
//     authentication_token: string
// }

export default class User extends Model {
  public schema: string = 'GEC';
  public table: string = 'users';
  public keyType: string = 'uuid';
  public keyName: string = 'user_id';

  public columns: string[] = [
    'user_id',
    'email',
    'password',
    'salt',
    'sns',
    'phone_number',
    'gender',
    'nickname',
    'memo',
    'status',
    'active_date',
    'authentication_token',
    'created_at',
    'updated_at',
  ];

  public hex_fields: string[] = [
    'user_id'
  ];

  public exclude_columns: string[] = [
    'password',
    'salt'
  ];

  constructor(connection?: any) {
    super(connection);
  }

  public async inquiries():Promise<any> {
    return this.hasMany(UserInquiry, 'user_id', 'user_id', 'user_inquiries');
  }

  public async productInquiries():Promise<any> {
    return this.hasMany(ProductInquiry, 'user_id', 'user_id', 'product_inquiries');
  }

  public async productReviews():Promise<any> {
    return this.hasMany(ProductReview, 'user_id', 'user_id', 'product_reviews');
  }
}

