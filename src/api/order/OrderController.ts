import {ApiController} from "../../Apps/ApiController";
import Order from "../../models/Order";
import Responder from "../../utils/Responder";

import {Request, Response} from 'express';

export default class OrderController extends ApiController {
  public path: string = '/orders';
  public keyName: string = 'order_id';
  public Model: any = Order;

  constructor() {
    super();
  }

  public show = async (request: Request, response: Response): Promise<any> => {
    const responder = new Responder(response);
    const model = new this.Model();

    try {
      model.fields[model.keyName] = request.params[model.keyName];

      await model.getConnection();

      await model.find();
      await model.orderProducts();

      responder.body.data = model.fields;
      responder.body.success = true;
    } catch (e) {
      console.error(e);
      responder.body.error = true;
      responder.body.msg = e.message;
      responder.body.errorObject = e;
      // responder.status = 500;
    } finally {
      await model.close();
      responder.send();
    }
  }
}
