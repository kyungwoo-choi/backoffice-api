import {ApiController, ISearchParams} from "../../Apps/ApiController";
import User from '../../models/User'

// import UserInquiryController from "../user-inquiries/UserInquiryController";
// import {Request, Response} from "express";
// import Responder from "../../utils/Responder";

export default class UserController extends ApiController {
  public Model: any = User;
  public path: string = '/users';
  public keyName: string = 'user_id';

  public searchParams: ISearchParams = {
    'user_nickname': {
      column: 'nickname',
      type: 'like'
    },
    'mobile': {
      column: 'phone_number',
      type: 'like'
    },
    'email': {
      column: 'email',
      type: 'like'
    },
    'status': 'status',
    'user_code': 'user_id'
  };

  constructor() {
    super();
  }
}
