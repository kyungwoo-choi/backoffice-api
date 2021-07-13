import {ApiController} from "../../Apps/ApiController";
import ProductInquiry from "../../models/ProductInquiry";

export default class ProductInquiryController extends ApiController {
  public path:string = '/product-inquiries';
  public Model:any = ProductInquiry;
  public keyName:string = 'product_inquiry_idx';

  constructor() {
    super();
  }
}
