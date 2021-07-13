import {Model} from '../Apps/Model'

export default class Category extends Model {
  public keyName: string = 'category_id';
  public keyType: string = 'uuid';
  public schema: string = 'GEC';
  public table: string = 'categories';

  public hex_fields: string[] = [
    'category_id',
    'parent_id'
  ];

  constructor(connection?: any) {
    super(connection);
  }

  public async makeTree(categories: any[], category_id?:number | null, onlyParent?: boolean): Promise<any> {
    for (const row of categories) {
      row.children = [];
    }

    for (const row of categories) {
      for (const category of categories) {
        if (category.category_id === row.parent_id) {
          category.children.push(row);
        }
      }
    }

    if (category_id) {
      for (const category of categories) {
        if (+category_id === category.category_id) {
          categories = category;
          break;
        }
      }
    } else {
      const result_ = [];
      for (const category of categories) {
        if (onlyParent) {
          result_.push(category);
        } else {
          if (!category.parent_id) {
            result_.push(category);
          }
        }
      }

      categories = result_;
    }

    return categories
  }

  public async getAll(category_id?: number | null, makeTree?: 'tree' | undefined): Promise<any> {
    let {rows} = await this.get(false);
    let categories = rows;

    if (makeTree) {
      categories = await this.makeTree(categories, category_id);
    }

    return categories;
  }

  public async getParents(category_id: number): Promise<any> {
    console.time('getParents');
    let categories = await this.getAll();
    let result = [];

    categories = await this.makeTree(categories, null, true);

    const getParent = (parent_id: number): any[] => {
      let result = [];

      for (const category of categories) {
        if (parent_id === category.category_id) {
          result.push(category);

          if (category.parent_id) {
            result = result.concat(getParent(category.parent_id));
          }
        }
      }

      return result;
    };

    for (const category of categories) {
      if (category.category_id === category_id) {
        if (category.parent_id) {
          result = getParent(category.parent_id);
          result = result.reverse();
        }

        result.push(category);
        break;
      }
    }
    console.timeEnd('getParents');
    return result;
  }
}
