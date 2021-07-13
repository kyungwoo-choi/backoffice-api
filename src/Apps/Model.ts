import {Connection, RowDataPacket} from 'mysql2/promise';
import pool from '../database';
import uuid from '../utils/uuid';

interface IModel {
  schema: string;
  table: string;
  connection: any | null;
  keyType: string;
  keyName: string;

  // db table 컬럼
  columns?: string[];
  // 조회시 제외할 컬럼, 설정안하면 그냥 다 가져옴
  exclude_columns?: string[];
  // 조회시 uuid로 구성된 binary필드일 경우 convert할수있게 설정하는 값
  hex_fields?: string[];

  getConnection(): Promise<void>;

  query(query: string, params?: object): Promise<RowDataPacket[]>;

  findOne(): Promise<any>;

  get(): Promise<any>;

  save(): Promise<any>;

  delete(): Promise<any>;

  close(): Promise<void>;
}

export class Model implements IModel {
  public schema: string = '';
  public table: string = '';
  public keyType: string = 'uuid';
  public keyName: string = 'id';

  public connection: any | null;

  // 인스턴스에 바인딩되는 컬럼과 값이 들어가는 value
  // columns 와는 별개
  public fields: any = {};

  public columns: string[] = [];
  public exclude_columns?: string[] = [];
  public hex_fields?: string[] = [];

  private _where: string = '';
  private _params: Array<any> = [];
  private _fields: Array<any> = [];

  private _join: string = '';
  private _subQuery: string = '';
  private _page: string = '';
  private _pagination: any[] = [];

  public _hasMany: Array<any> = [];

  constructor(connection?: any) {
    if (connection) {
      this.connection = connection;
    } else {
      this.connection = null;
    }
  }

  protected async generateKey(): Promise<string> {
    const _uuid: Buffer = uuid.v1();

    this.fields[this.keyName] = uuid.decode(_uuid);

    return this.fields[this.keyName];
  }

  public async getConnection(): Promise<void> {
    if (this.connection) {
      return;
    }

    this.connection = await pool.getConnection();
  }

  public async query(query: string, params?: object): Promise<RowDataPacket[]> {
    if (this.connection === null || !this.connection) {
      // throw {
      //     message: 'have not connection'
      // };
      await this.getConnection();
    }
    console.log(query, params);
    return await this.connection.query(query, params)
  }

  public async getQueryKeyValue(): Promise<any> {
    let result;

    result = this.fields[this.keyName];
    if (this.keyType === 'uuid') {
      result = await uuid.toBuffer(result);
    }

    return result;
  }

  public async getKeyValue(): Promise<any> {
    let result;

    result = this.fields[this.keyName];
    if (this.keyType === 'uuid') {
      result = result.toLowerCase();
    }

    return result;
  }

  public convertSelectColumnUUIDtoHex(column: string): string {
    return `LOWER(HEX(${this.table}.${column})) as ${column}`
  }

  // ================================================ 수정중
  public async setSelectColumns(columns: Array<any>): Promise<void> {
    this._fields = [];

    for (const column of columns) {
      if (typeof column === 'object') {
        if (column.hex) {
          // const name: string = this.convertSelectColumnUUIDtoHex(column.name);
          this._fields.push(`LOWER(HEX(${column.name})) ${column.alias ? 'as ' + column.alias : ''}`)
        } else {
          this._fields.push(`${column.name} ${column.alias ? 'as ' + column.alias : ''}`)
        }
      } else {
        this._fields.push(`${column}`)
      }
    }
  }

  protected async makeHexColumns(): Promise<string> {
    if (!this.hex_fields) {
      return '';
    }

    let columns = [];

    for (const column of this.hex_fields) {
      columns.push(`LOWER(HEX(${this.table}.${column})) as ${column}`)
    }

    return columns.join(', ');
  }

  protected async makeColumns(): Promise<string> {
    let columnArray: string[] = [];

    let key: string = `${this.table}.${this.keyName}`;

    if (this.keyType === 'uuid') {
      key = this.convertSelectColumnUUIDtoHex(this.keyName);
    }

    // 별도로 컬럼을 설정하지 않았을때
    if (!this.columns || !this.columns.length) {
      columnArray.push(`${this.table}.*`);
      columnArray.push(key);
      const hexColumns = await this.makeHexColumns();

      if (hexColumns) {
        columnArray.push(hexColumns);
      }

      return columnArray.join(', ');
    }

    columnArray.push(key);

    for (const column of this.columns) {
      if (column === this.keyName) {
        continue;
      }

      // 조회 제외컬럼 목록 리스트에 있는지 보고 있으면 continue
      if (typeof this.exclude_columns === 'object') {
        if (this.exclude_columns.indexOf(column) > -1) {
          continue;
        }
      }

      // hex fields안에 있으면 convert후 continue
      if (typeof this.hex_fields === 'object') {
        if (this.hex_fields.indexOf(column) > -1) {
          columnArray.push(this.convertSelectColumnUUIDtoHex(column));
          continue
        }
      }

      columnArray.push(`${this.table}.${column}`);
    }

    return columnArray.join(', ');
  }

  // ================================================ 수정중
  public async where(where: Array<any> = []): Promise<any> {
    let whereList: Array<string> = [];

    let _where: string = '';
    let _params: Array<any> = [];

    if (typeof (where) === 'object' && where.length) {
      for (const param of where) {
        switch (param.length) {
          case 1:
            break;

          //  [column, param] = equal
          case 2:
            whereList.push(`${param[0]} = ?`);
            _params.push(param[1]);
            break;


          //  [column, 'in', [param1, param2, param3]] = in
          //  [column, 'like', param] = like
          //  [column, '=' || '>' || '>=' || '<' || '<=' || '!=', param]
          case 3:
            if (param[1] === 'in') {
              let slot = [];

              for (const p of param[2]) {
                slot.push('?');
                _params.push(p);
              }

              whereList.push(`${param[0]} in (${slot.join(',')})`);
            } else if (param[1] === 'like') {
              whereList.push(`${param[0]} like ?`);
              _params.push(`%${param[2]}%`);
            } else {
              whereList.push(`${param[0]} ${param[1]} ?`);
              _params.push(param[2]);
            }
            break;

          default:
            throw {
              message: 'buildWhere wrong'
            };
        }
      }

      if (whereList.length && _params.length) {
        _where = `where ${whereList.join(' and ')}`;
      }
    }

    this._where = _where;
    this._params = _params;

    return this;
  }

  protected join(type: string, table: string, on: string) {
    const types = ['inner', 'left outer join'];

    this._join += ` ${type} ${table} on ${on}`
  }

  protected subQuery(subQuery: string) {
    this._subQuery += ` ${subQuery}`;
  }

  protected pagination(page: any = 1, pageLimit: any = 30) {
    page = +page;
    pageLimit = +pageLimit;

    if (typeof page !== 'number' || isNaN(page)) {
      page = 1;
    }

    if (typeof pageLimit !== 'number' || isNaN(pageLimit)) {
      pageLimit = 30;
    }

    if (page < 1) {
      page = 1;
    }

    if (pageLimit < 1) {
      pageLimit = 30;
    }

    let offset: number = page - 1;

    offset = offset * pageLimit;

    this._page = `limit ?, ?`;
    this._pagination.push(offset);
    this._pagination.push(pageLimit);

    return {
      _page: page,
      _pageLimit: pageLimit
    }
  }

  protected async hasMany(Model: any, parentKey: string, childKey: string, mappingKeyName?: string): Promise<any> {
    const model: Model = new Model(this.connection);

    await model.where([
      [childKey, await this.getQueryKeyValue()]
    ]);

    let {rows} = await model.get(false);
    if (mappingKeyName) {
      this.fields[mappingKeyName] = rows;
    }

    return rows
  }

  public async get(pagination?: boolean, page?: number, pageLimit?: number): Promise<any> {
    if (!this.connection) {
      await this.getConnection();
    }

    let _columns: string = await this.makeColumns();

    // 조회컬럼이 세팅되어있으면
    if (this._fields.length) {
      _columns = `${this._fields.join(', ')}`;
    }

    let _params: Array<any> = [];
    let _where: string = '';

    // where 세팅이 되어있으면
    if (this._params.length) {
      _params = this._params;
      _where = this._where;
    }

    let query: string;

    let pageInfo = {
      page: 0,
      pageLimit: 0,
      totalCount: 0,
      totalPageCount: 0
    };

    // 페이징처리
    if (pagination) {
      query = `select count(*) as pageCount from ${this.schema}.${this.table} ${this._join} ${_where}`;
      const [rows] = await this.query(query, _params);

      let {_page, _pageLimit} = this.pagination(page, pageLimit);

      pageInfo.totalCount = rows[0].pageCount;
      pageInfo.page = _page;
      pageInfo.pageLimit = _pageLimit;
      pageInfo.totalPageCount = Math.floor(pageInfo.totalCount / _pageLimit);
      if (pageInfo.totalCount % _pageLimit > 0) {
        pageInfo.totalPageCount++;
      }
    }

    // data
    query = `select ${_columns} from ${this.schema}.${this.table} ${this._join} ${_where} ${this._page}`;
    const [rows] = await this.query(query, _params.concat(this._pagination));

    return {
      pagination: pageInfo,
      rows: rows
    }
  }

  // ================================================ 수정중
  public async findOne(where?: object | null): Promise<any> {
    if (this.connection === null) {
      await this.getConnection();
    }

    const params: Array<any> = [];
    const key: string = this.keyName;

    let query: string = `select * from ${this.schema}.${this.table} where ${key} = ?`;
    const [rows] = await this.query(query, params);

    return rows;
  }

  public async find(keyValue?: number | string): Promise<any> {
    await this.getConnection();

    const columns = await this.makeColumns();

    let query = `select ${columns} from ${this.schema}.${this.table} where ${this.keyName} = ?`;

    let [rows] = await this.query(query, [keyValue || await this.getQueryKeyValue()]);
    if (!rows.length) {
      throw {
        message: 'not exist row by key'
      }
    }

    this.fields = rows[0];

    if (this.keyType === 'uuid') {
      this.fields[this.keyName] = uuid.decode(this.fields[this.keyName]);
    }

    return rows[0];
  }

  public async save(): Promise<any> {
    await this.getConnection();

    let _fields = Object.assign({}, this.fields);

    if (this.keyType === 'uuid' && !this.fields[this.keyName]) {
      await this.generateKey();
    }

    _fields[this.keyName] = await this.getQueryKeyValue();
    if (this.hex_fields && this.hex_fields.length) {
      for (const key in _fields) {
        if (this.hex_fields.indexOf(key) > -1) _fields[key] = uuid.toBuffer(_fields[key]);
      }
    }

    let query = `insert into ${this.schema}.${this.table} set ? on duplicate key update ?, updated_at = CURRENT_TIMESTAMP()`;

    const [result] = await this.query(query, [_fields, _fields]);

    let insertId: number | string = result.insertId;

    if (this.keyType === 'uuid') {
      insertId = this.fields[this.keyName]
    }

    return insertId;
  }

  public async bulkInsert(fields?: string[] | null, params?: any[]): Promise<any> {
    await this.getConnection();

    if (!fields) {
      fields = this.columns;
    }

    let query = `insert into ${this.schema}.${this.table} (${fields.join(', ')}) values ?`;

    return await this.query(query, [params]);
  }

  public async delete(keyValue?: number | string): Promise<any> {
    await this.getConnection();

    let query = `delete from ${this.schema}.${this.table} where ${this.keyName} = ?`;

    let [rows] = await this.query(query, [keyValue || await this.getQueryKeyValue()]);

    return rows[0];
  }

  public async close(): Promise<void> {
    if (!this.connection) {
      return;
    }

    await this.connection.release();
    this.connection = null;
  }

  static async convertStringToUuidKey(key: string): Promise<any> {
    return uuid.toBuffer(key);
  }
}
