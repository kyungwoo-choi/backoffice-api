import {Model} from "../Apps/Model";
import Product from "./Product";
import Brand from "./Brand";
import Category from "./Category";

import PromotionProduct from "./PromotionProduct";
import PromotionBrand from "./PromotionBrand";
import PromotionCategory from "./PromotionCategory";

export default class Promotion extends Model {
  public schema: string = 'gec_promotion';
  public table: string = 'promotions';
  public keyType: string = 'ai';
  public keyName: string = 'promotion_idx';

  public columns: string[] = [
    'promotion_idx',
    'promotion_delete_flag',
    'promotion_code',
    'promotion_name',
    'discount_type',
    'discount',
    'usable_discount_product',
    'expiration_date',
    'status',
    'created_at',
    'updated_at'
  ];

  constructor(connection?: any) {
    super(connection);
  }

  async products(): Promise<any> {
    return this.hasMany(PromotionProduct, 'promotion_idx', 'promotion_idx', 'products')
  }

  async brands(): Promise<any> {
    return this.hasMany(PromotionBrand, 'promotion_idx', 'promotion_idx', 'brands')
  }

  async categories(): Promise<any> {
    return this.hasMany(PromotionCategory, 'promotion_idx', 'promotion_idx', 'categories')
  }

  async savePromotionProduct(promotionIdx: number, products: any[]) {
    if(!products.length) {
      return;
    }

    const promotionProduct = new PromotionProduct(this.connection);
    const product = new Product(this.connection);

    const productIds = [];
    const productParams = [];
    for (const productData of products) {
      const productId = await Product.convertStringToUuidKey(productData.product_id);
      productIds.push(productId);

      let usable = productData.usable;
      if(usable === undefined) {
        usable = 1;
      }

      productParams.push([
        promotionIdx,
        productId,
        usable
      ])
    }

    await product.where([
      ['product_id', 'in', productIds]
    ]);

    let result = await product.get(false);

    if (result.rows.length !== products.length) {
      throw {
        message: '잘못된 상품번호가 존재합니다.'
      }
    }

    await promotionProduct.bulkInsert([
      'promotion_idx',
      'promotion_product_id',
      'usable'
    ], productParams);
  }

  async savePromotionCategory(promotionIdx: number, categories: any[]) {
    if(!categories.length) {
      return;
    }

    const promotionCategory = new PromotionCategory(this.connection);
    const category = new Category(this.connection);

    const categoryIds = [];
    const categoryParams = [];
    for (const categoryData of categories) {
      const categoryId = categoryData.category_id;
      categoryIds.push(categoryId);

      let usable = categoryData.usable;
      if(usable === undefined) {
        usable = 1;
      }

      categoryParams.push([
        promotionIdx,
        categoryId,
        usable
      ])
    }

    await category.where([
      ['category_id', 'in', categoryIds]
    ]);

    let result = await category.get(false);

    if (result.rows.length !== categories.length) {
      throw {
        message: '잘못된 카테고리번호가 존재합니다.'
      }
    }

    await promotionCategory.bulkInsert([
      'promotion_idx',
      'promotion_category_id',
      'usable'
    ], categoryParams);
  }

  async savePromotionBrand(promotionIdx: number, brands: any[]) {
    if(!brands.length) {
      return;
    }

    const promotionBrand = new PromotionBrand(this.connection);
    const brand = new Brand(this.connection);

    const brandIds = [];
    const brandParams = [];
    for (const brandData of brands) {
      const brandId = await Brand.convertStringToUuidKey(brandData.brand_id);
      brandIds.push(brandId);

      let usable = brandData.usable;
      if(usable === undefined) {
        usable = 1;
      }

      brandParams.push([
        promotionIdx,
        brandId,
        usable
      ])
    }

    await brand.where([
      ['brand_id', 'in', brandIds]
    ]);

    let result = await brand.get(false);

    if (result.rows.length !== brands.length) {
      throw {
        message: '잘못된 브랜드 번호가 존재합니다.'
      }
    }

    await promotionBrand.bulkInsert([
      'promotion_idx',
      'promotion_brand_id',
      'usable'
    ], brandParams);
  }

  async issue(promotionData: any): Promise<any> {
    this.fields.promotion_code = promotionData.promotion_code;
    this.fields.promotion_name = promotionData.promotion_name;
    this.fields.discount_type = promotionData.discount_type;
    this.fields.discount = promotionData.discount;
    this.fields.usable_discount_product = promotionData.usable_discount_product;
    this.fields.expiration_date = promotionData.expiration_date;

    const promotionIdx = await this.save();

    if(promotionData.products) {
      await this.savePromotionProduct(promotionIdx, promotionData.products);
    }

    if(promotionData.categories) {
      await this.savePromotionCategory(promotionIdx, promotionData.categories);
    }

    if(promotionData.brands) {
      await this.savePromotionBrand(promotionIdx, promotionData.brands);
    }
  }
}
