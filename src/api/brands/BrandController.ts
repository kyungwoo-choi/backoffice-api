import {ApiController} from "../../Apps/ApiController";
import Brand from "../../models/Brand";

export default class BrandController extends ApiController {
  public path: string = '/brands';
  public Model: any = Brand;
  public keyName: string = 'brand_id';

  public defaultPagination: boolean = false;

  constructor() {
    super()
  }
}
