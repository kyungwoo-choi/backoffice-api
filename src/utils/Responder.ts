'use strict';
import {Response} from 'express';

interface IResponseBody {
  msg: string;
  error: boolean;
  errorObject: any;
  success: boolean;
  data: any;
  pagination?: IPagination;
}

interface IResponder {
  res: Response;
  status: number;
  body: IResponseBody;
}

interface IPagination {
  totalCount?: number;
  page?: number;
  pageLimit?: number;
  totalPageCount?: number;
}

export default class Responder implements IResponder {
  public res: Response;
  public status: number;
  public body: IResponseBody;
  public pagination?: IPagination;

  constructor(res: Response) {
    this.res = res;
    this.status = 200;

    this.body = {
      msg: '',
      error: false,
      success: false,
      data: null,
      errorObject: null,
      pagination: this.pagination
    }
  }

  send(): void {
    this.res.status(this.status).json(this.body)
  }
};
