import {ApiController} from "../../Apps/ApiController";
import UserInquiry from "../../models/UserInquiry";

export default class UserInquiryController extends ApiController {
  public path: string = '/user-inquiries';
  public Model: any = UserInquiry;
  public keyName: string = 'inquiry_idx';

  constructor() {
    super();

  }
}
