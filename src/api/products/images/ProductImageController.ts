import {Request, Response} from 'express'

import {ApiController} from "../../../Apps/ApiController";
import Option from "../../../models/Option";
import ProductImage from "../../../models/ProductImage";
// import Uploader from '../../../utils/Uploader'

import Product from "../../../models/Product";

import Responder from "../../../utils/Responder";

export default class ProductImageController extends ApiController {
  public path: string = '/images';
  public Model: any = ProductImage;
  public parentKeyName: string = 'product_id';
  public isChild: boolean = true;
  public keyName:string = 'image_idx';

  constructor() {
    super();
  }

  public post = async (request: Request, response: Response): Promise<any> => {
    // const model = new this.Model();
    // const responder = new Responder(response);
    //
    // try {
    //   await model.getConnection();
    //
    //   const product:Product = new Product(model.connection);
    //   product.fields.product_id = request.params.product_id;
    //   await product.find();
    //
    //   const product_id:string = await product.getQueryKeyValue();
    //
    //   // 상품이미지 업로드 설정
    //   const uploader:Uploader = new Uploader(
    //     process.env.IMAGE_PATH || '',
    //     'array',
    //     'images',
    //     10,
    //     await product.getKeyValue() + '/'
    //   );
    //
    //   await uploader.run(request, response);
    //
    //   const files: any = request.files;
    //
    //   for (const file of files) {
    //     model.fields.product_id = product_id;
    //     model.fields.filename = file.key;
    //     model.fields.path = file.location;
    //     model.fields.type = 'detail';
    //
    //     await model.save()
    //   }
    //
    //   responder.body.success = true;
    // } catch (e) {
    //   console.error(e);
    //   responder.body.error = true;
    // } finally {
    //   await model.close();
    //   responder.send();
    // }
  }
}
