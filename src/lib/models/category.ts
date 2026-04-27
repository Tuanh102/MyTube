import db from '../db';

export interface Category {
  category_id: number;
  category_name: string;
}

export const categoryModel = {
  async getAllCategories(): Promise<Category[]> {
    const sql = 'SELECT * FROM categories WHERE category_id BETWEEN 2 AND 11 ORDER BY category_id ASC';
    return await db.query<Category[]>(sql);
  }
};
