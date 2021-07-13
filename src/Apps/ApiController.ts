import {Router, Request, Response, NextFunction} from 'express'
import {INTERNAL_SERVER_ERROR, OK} from "http-status-codes"
import Responder from "../utils/Responder";

interface IApiController {
  Model: any;
  router: Router;
  keyName: string;
  path: string;
  parentKeyName?: string;
  isChild?: boolean

  defaultPagination: boolean;

  index(request: Request, response: Response): Promise<any>

  post(request: Request, response: Response): Promise<any>

  put(request: Request, response: Response, keyName: string): Promise<any>

  delete(request: Request, response: Response, keyName: string): Promise<any>

  show(request: Request, response: Response, keyName: string): Promise<any>

  middleware?(path?: string, ...handlers: any[]): void

  bindModel(request: Request, response: Response, next: NextFunction): Promise<any>
}

export interface ISearchParams {
  [key: string]: any;
}

export class ApiController implements IApiController {
  public Model: any;
  public router: Router = Router({
    mergeParams: true
  });
  public keyName: string = '';
  public path: string = '';

  public defaultPagination: boolean = true;

  protected excludedQueryKeys = ['order', 'page', 'pageLimit'];
  public searchParams: ISearchParams = {};

  constructor() {
  }

  public middleware(path?: string, ...handlers: any[]): void {
    if (!path) {
      this.router.use('/', handlers);
    } else {
      this.router.use(path, handlers)
    }
  }

  protected bindFilterController = async (model: any, request: Request): Promise<any> => {
    const where: any[] = [];

    for (const queryName in request.query) {
      if (this.excludedQueryKeys.indexOf(queryName) > -1) {
        continue;
      }

      if (!this.searchParams.hasOwnProperty(queryName)) {
        continue;
      }

      if (typeof this.searchParams[queryName] === 'string') {
        where.push([
          this.searchParams[queryName], request.query[queryName]
        ])
      } else if (typeof this.searchParams[queryName] === 'object') {
        where.push([
          this.searchParams[queryName].column, this.searchParams[queryName].type, request.query[queryName]
        ]);
      } else if (typeof this.searchParams[queryName] === 'function') {
        const paramInfo = this.searchParams[queryName](request.query[queryName]);

        where.push([
          paramInfo.column, paramInfo.type, paramInfo.param
        ])
      }
    }

    await model.where(where);
  };

  // 기본 API 라우터들
  public index = async (request: Request, response: Response): Promise<any> => {
    const responder = new Responder(response);
    const model = new this.Model();

    try {
      // filter set
      if (request.query) {
        await this.bindFilterController(model, request);
      }

      const {pagination, rows} = await model.get(this.defaultPagination, request.query.page, request.query.pageLimit);

      responder.body.pagination = pagination;
      responder.body.data = rows;
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
  };

  public post = async (request: Request, response: Response): Promise<any> => {
    const responder = new Responder(response);
    const model = new this.Model();

    try {
      model.fields = request.body;

      responder.body.data = {};
      responder.body.data[this.keyName] = await model.save();
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
  };

  public put = async (request: Request, response: Response): Promise<any> => {
    const responder = new Responder(response);
    const model = new this.Model();

    try {
      model.fields = request.body;
      model.fields[model.keyName] = request.params[model.keyName];

      responder.body.data = {};
      responder.body.data[this.keyName] = await model.save();
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
  };

  public delete = async (request: Request, response: Response): Promise<any> => {
    const responder = new Responder(response);
    const model = new this.Model();

    try {
      await model.delete(request.params[this.keyName]);

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
  };

  public show = async (request: Request, response: Response): Promise<any> => {
    const responder = new Responder(response);
    const model = new this.Model();

    try {
      model.fields[model.keyName] = request.params[model.keyName];

      responder.body.data = await model.find();
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
  };

  public bindModel = async (request: Request, response: Response, next: NextFunction): Promise<any> => {
    if (request.params[this.keyName]) {
      const model = new this.Model();
    } else {
      const responder = new Responder(response);

      responder.body.error = true;
      responder.body.msg = '존재하지 않는 데이터입니다.';


    }
  };

  // 기본 API 라우터를 반환함
  public route() {
    this.register(`/`, 'get', this.index);
    this.register(`/`, 'post', this.post);
    this.register(`/:${this.keyName}`, 'put', this.put);
    this.register(`/:${this.keyName}`, 'delete', this.delete);
    this.register(`/:${this.keyName}`, 'get', this.show);

    return this.router;
  }

  public register(path: string, method: string, handler: any, ...handlers: any[]) {
    if (method === 'get') {
      this.router.get(path, ...handlers, handler);
    } else if (method === 'post') {
      this.router.post(path, ...handlers, handler);
    } else if (method === 'put') {
      this.router.put(path, ...handlers, handler);
    } else if (method === 'delete') {
      this.router.delete(path, ...handlers, handler);
    }
  };
}


