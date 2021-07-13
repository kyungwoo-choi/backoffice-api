import {Model} from '../Apps/Model';
import Option from "./Option";
import OptionKey from "./OptionKey";
import ProductImage from "./ProductImage";
import Category from "./Category";
import ProductInquiry from './ProductInquiry';
import ProductReview from './ProductReview'

export default class Product extends Model {
  public schema: string = 'GEC';
  public table: string = 'products';
  public keyType: string = 'uuid';
  public keyName: string = 'product_id';

  public columns: string[] = [
    'product_id',
    'store_id',
    'category_id',
    'brand_id',
    'name',
    'description',
    'main_image',
    'list_image',
    'cost',
    'status',
    'created_at',
    'updated_at',
  ];

  public hex_fields: string[] = [
    'product_id',
    'store_id'
  ];

  public exclude_columns: string[] = [];

  constructor(connection?: any) {
    super(connection);
  }

  public async options(): Promise<any> {
    return this.hasMany(Option, 'product_id', 'product_id', 'options');
  }

  public async optionKeys(): Promise<any> {
    return this.hasMany(OptionKey, 'product_id', 'product_id', 'option_keys');
  }

  public async productImage(): Promise<any> {
    return this.hasMany(ProductImage, 'product_id', 'product_id', 'detail_images');
  }

  public async inquiries(): Promise<any> {
    return this.hasMany(ProductInquiry, 'product_id', 'product_id', 'inquiries');
  }

  public async reviews(): Promise<any> {
    return this.hasMany(ProductReview, 'product_id', 'product_id', 'reviews');
  }

  public async fetchProductDetail(): Promise<any> {
    await this.find();
    await this.options();
    await this.optionKeys();
    await this.productImage();
    await this.inquiries();

    const category = new Category(this.connection);
    this.fields.category_info = await category.getParents(this.fields.category_id);
  }

  // 상품목록
  public async getAll(query: any) {
    await this.getConnection();

    // const query = `
    //     select LOWER(HEX(products.product_id)) as product_id,
    //            LOWER(HEX(products.store_id))   as store_id,
    //            stores.name                     as store_name,
    //            products.category_id,
    //            products.brand_id,
    //            products.name,
    //            products.description,
    //            products.main_image,
    //            products.list_image,
    //            products.cost,
    //            products.status,
    //            products.created_at,
    //            products.updated_at,
    //            brands.brand_name,
    //            categories.depth,
    //            categories.name,
    //            categories.parent_id,
    //            (
    //                select path
    //                from GEC.product_images ppi
    //                where GEC.products.product_id = ppi.product_id
    //                limit 1
    //            )                               AS thumb_image,
    //            (
    //                select count(product_id)
    //                from GEC.wish_lists wl
    //                where GEC.products.product_id = wl.product_id
    //                group by wl.product_id
    //            )                               as wish_count
    //     from GEC.products
    //              join GEC.brands on products.brand_id = brands.brand_id
    //              join GEC.categories on products.category_id = categories.category_id
    //              join GEC.stores on products.store_id = stores.store_id
    // `;

    await this.setSelectColumns([{
      name: 'products.product_id',
      hex: true,
      alias: 'product_id'
    }, {
      name: 'products.store_id',
      hex: true,
      alias: 'store_id'
    }, {
      name: 'stores.name as store_name'
    }, {
      name: 'products.brand_id'
    }, {
      name: 'products.name'
    }, {
      name: 'products.description'
    }, {
      name: 'products.cost'
    }, {
      name: 'products.status'
    }, {
      name: 'products.created_at'
    }, {
      name: 'products.updated_at'
    }, {
      name: 'brands.brand_name'
    }, {
      name: 'categories.depth'
    }, {
      name: 'categories.name',
      alias: 'category_name'
    }, {
      name: 'categories.parent_id'
    }, {
      name: `
            (
               select path
               from GEC.product_images ppi
               where GEC.products.product_id = ppi.product_id
               limit 1
            ) AS thumb_image
            `
    }, {
      name: `
            (
               select count(product_id)
               from GEC.wish_lists wl
               where GEC.products.product_id = wl.product_id
               group by wl.product_id
            ) as wish_count
            `
    }, {
      name: 'product_stocks.total_stocks'
    }]);

    this.join('join', 'GEC.brands', 'products.brand_id = brands.brand_id');
    this.join('join', 'GEC.categories', 'products.category_id = categories.category_id');
    this.join('join', 'GEC.stores', 'products.store_id = stores.store_id');
    this.join('left join',
      '(select product_id, sum(stock) as total_stocks from GEC.product_options group by product_id) as product_stocks ',
      'products.product_id = product_stocks.product_id');

    const {pagination, rows} = await this.get(true, query.page, query.pageLimit);

    return {pagination, rows};
  }
}
