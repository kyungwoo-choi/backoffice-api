import {ApiController} from "../../../Apps/ApiController";
import Option from "../../../models/Option";
import {Request, Response} from 'express';
import Product from "../../../models/Product";

export default class OptionsController extends ApiController {
  public path: string = '/options';
  public Model: any = Option;
  public keyName: string = 'option_id';
  public parentKeyName: string = 'product_id';
  public isChild: boolean = true;

  constructor() {
    super();
  }

  public index = async (request: Request, response: Response) => {
    try {
      const product = new Product();
      // const model = new this.Model();

      product.fields[product.keyName] = request.params[this.parentKeyName];

      const rows = await product.options();
      // await model.where([
      //     ['product_id', await product.getQueryKeyValue()]
      // ]);
      //
      // let [rows] = await model.get();
      response.status(200).json({
        data: rows
      });

      // await model.close()
      await product.close();
    } catch (e) {
      console.error(e);
      response.status(200).json({
        error: true
      })
    }
  }
}
