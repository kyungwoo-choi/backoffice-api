import {ApiController} from "../../Apps/ApiController";
import Promotion from "../../models/Promotion";
import {Request, Response} from "express";
import Responder from "../../utils/Responder";

import PromotionProduct from "../../models/PromotionProduct";
import PromotionCategory from "../../models/PromotionCategory";
import PromotionBrand from "../../models/PromotionBrand";

import Product from "../../models/Product";
import Category from "../../models/Category";
import Brand from "../../models/Brand";

export default class PromotionController extends ApiController {
  public path: string = '/promotions';
  public Model: any = Promotion;
  public keyName: string = 'promotion_idx';

  constructor() {
    super();
  }

  public post = async (request: Request, response: Response) => {
    const model = new this.Model();
    const responder = new Responder(response);

    try {
      await model.where([
        ['promotion_code', request.body.promotion_code]
      ]);

      let {rows} = await model.get(false);
      if (rows.length) {
        throw {
          message: '중복된 프로모션 코드입니다.'
        }
      }

      await model.connection.beginTransaction();

      await model.issue(request.body);

      responder.body.data = {};
      responder.body.success = true;
      await model.connection.commit();
    } catch (e) {
      console.error(e);
      await model.connection.rollback();
      responder.body.error = true;
      responder.body.errorObject = e;
      responder.body.msg = e.message;
    } finally {
      await model.close();
      responder.send();
    }
  }
}
