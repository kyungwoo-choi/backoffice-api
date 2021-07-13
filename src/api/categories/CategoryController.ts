import {Request, Response} from "express";
import {ApiController} from "../../Apps/ApiController";

import Category from "../../models/Category";
import Responder from "../../utils/Responder";

export default class CategoryController extends ApiController {
  public Model: any = Category;
  public path: string = '/categories';
  public keyName: string = 'category_id';

  constructor() {
    super();
  }

  public index = async (request: Request, response: Response): Promise<any> => {
    const responder = new Responder(response);
    const model = new this.Model();

    try {
      responder.body.data = await model.getAll(request.query.category_id, request.query.type);
      responder.body.success = true;
    } catch (e) {
      console.error(e);
      responder.body.error = true;
      responder.body.msg = e.message;
      responder.body.errorObject = e;
    } finally {
      responder.send();
      await model.close()
    }
  };

  public delete = async (request: Request, response: Response): Promise<any> => {
    const responder = new Responder(response);
    const model = new this.Model();

    try {
      await model.where([
        ['parent_id', request.params[this.keyName]]
      ]);

      let {rows} = await model.get(false);
      if (rows.length) {
        throw {
          message: '하위 카테고리가 존재하여 삭제할수 없습니다.'
        }
      }
      model.fields.category_id = request.params[this.keyName];
      await model.delete();

      responder.body.success = true;
    } catch (e) {
      console.error(e);
      responder.body.error = true;
      responder.body.msg = e.message;
      responder.body.errorObject = e;
    } finally {
      await model.close();
      responder.send();
    }
  }
}
