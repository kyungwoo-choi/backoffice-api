import {ApiController} from "../../Apps/ApiController";
import Payment from "../../models/Payment";

export default class PaymentController extends ApiController {
  public path: string = '/payments';
  public Model: any = Payment;
  public keyName: string = 'payment_idx';

  constructor() {
    super();
  }
}
