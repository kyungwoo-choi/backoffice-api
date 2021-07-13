import {ApiController, ISearchParams} from "../../Apps/ApiController";
import Product from '../../models/Product'
import OptionsController from "./options/OptionsController";
import ProductImageController from "./images/ProductImageController";

import {Request, Response, NextFunction} from 'express';
import Responder from "../../utils/Responder";

import Brand from "../../models/Brand";
import Category from "../../models/Category";
import Store from "../../models/Store";
import Option from "../../models/Option";

export default class ProductsController extends ApiController {
  public Model: any = Product;
  public path: string = '/products';
  public keyName: string = 'product_id';

  public searchParams: ISearchParams = {
    product_id: {
      type: 'like',
      column: 'product_id'
    },
    store_name: {
      type: 'like',
      column: 'store_name'
    },
    brand_id: {
      type: '=',
      column: 'products.brand_id'
    },
    status: {
      type: '=',
      column: 'status'
    },
    product_name: {
      type: 'like',
      column: 'products.name'
    },
    stock_status(val?: string) {
      if (val === '1') {
        return {
          column: 'total_stocks',
          type: '<=',
          param: 0
        }
      } else if (val === '2') {
        return {
          column: 'total_stocks',
          type: '>',
          param: 0
        }
      }
    }
    // stock_status: {
    //   type: '<=',
    //   column: 'total_stocks'
    // }
  };

  constructor() {
    super();

    const optionController = new OptionsController();
    const productImageController = new ProductImageController();

    this.router.use('/:product_id/options', optionController.route());
    this.router.use('/:product_id/images', productImageController.route());
  }

  public index = async (request: Request, response: Response): Promise<any> => {
    const model = new this.Model();
    const responder = new Responder(response);

    try {
      if (request.query) {
        await this.bindFilterController(model, request);
      }

      const {pagination, rows} = await model.getAll(request.query);
      responder.body.pagination = pagination;
      responder.body.data = rows;
      responder.body.success = true;
    } catch (e) {
      responder.body.error = true;
      responder.body.errorObject = e;
      responder.body.msg = e.message;
    } finally {
      await model.close();
      responder.send()
    }
  };

  public show = async (request: Request, response: Response): Promise<any> => {
    const model = new this.Model();
    const responder = new Responder(response);

    try {
      model.fields.product_id = request.params.product_id;
      await model.fetchProductDetail();

      responder.body.data = model.fields;
      responder.body.success = true;
    } catch (e) {
      console.error(e);
      responder.body.error = true;
      responder.body.errorObject = e;
      responder.body.msg = e.message;
    } finally {
      await model.close();
      responder.send()
    }
  };

  public post = async (request: Request, response: Response): Promise<any> => {
    const model = new this.Model();
    const responder = new Responder(response);
    await model.getConnection();

    try {
      const brand = new Brand(model.connection);
      await brand.find(request.body.brand_id);

      const category = new Category(model.connection);
      await category.find(request.body.category_id);

      await category.where([
        ['parent_id', category.fields.category_id]
      ]);
      const childrenCategory = await category.get(false);

      if (childrenCategory.rows.length) {
        throw {
          message: '선택한 카테고리가 최종카테고리가 아닙니다.'
        }
      }

      const store = new Store(model.connection);
      store.fields.store_id = request.body.store_id;
      await store.find();

      await model.connection.beginTransaction();

      // 상품정보 저장
      model.fields.name = request.body.name;
      model.fields.store_id = await store.getQueryKeyValue();
      model.fields.brand_id = request.body.brand_id;
      model.fields.cost = request.body.cost;
      model.fields.status = request.body.status;
      model.fields.category_id = request.body.category_id;
      model.fields.description = request.body.description;

      const product_id = await model.save();

      // 옵션관련
      const option = new Option(model.connection);
      await option.create(await model.getQueryKeyValue(), request.body.option);

      await model.connection.commit();
      responder.body.data = {
        product_id: await model.getKeyValue()
      };
      responder.body.success = true;
    } catch (e) {
      console.error(e);
      await model.connection.rollback();
      responder.body.error = true;
      responder.body.errorObject = e;
      responder.body.msg = e.message;
    } finally {
      await model.close();
      responder.send()
    }
  }

  public put = async (request: Request, response: Response): Promise<any> => {
    const model = new this.Model();
    const responder = new Responder(response);
    await model.getConnection();

    try {
      const brand = new Brand(model.connection);
      await brand.find(request.body.brand_id);

      const category = new Category(model.connection);
      await category.find(request.body.category_id);

      await category.where([
        ['parent_id', category.fields.category_id]
      ]);
      const childrenCategory = await category.get(false);

      if (childrenCategory.rows.length) {
        throw {
          message: '선택한 카테고리가 최종카테고리가 아닙니다.'
        }
      }

      const store = new Store(model.connection);
      store.fields.store_id = request.body.store_id;
      await store.find();

      await model.connection.beginTransaction();

      // 상품정보 저장
      model.fields.product_id = request.params.product_id;
      model.fields.name = request.body.name;
      model.fields.store_id = await store.getQueryKeyValue();
      model.fields.brand_id = request.body.brand_id;
      model.fields.cost = request.body.cost;
      model.fields.status = request.body.status;
      model.fields.category_id = request.body.category_id;
      model.fields.description = request.body.description;

      const product_id = await model.save();

      // 옵션관련
      const option = new Option(model.connection);
      await option.create(await model.getQueryKeyValue(), request.body.option);

      await model.connection.commit();
      responder.body.data = {
        product_id: await model.getKeyValue()
      };
      responder.body.success = true;
    } catch (e) {
      console.error(e);
      await model.connection.rollback();
      responder.body.error = true;
      responder.body.errorObject = e;
      responder.body.msg = e.message;
    } finally {
      await model.close();
      responder.send()
    }
  }
}
