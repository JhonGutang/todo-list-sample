import { Category } from '@todolist/shared-types';
import { executeSqlAsync } from '../storage/db';

function rowToCategory(row: any): Category {
    return {
        id: row.id,
        name: row.name,
        color: row.color,
        isDefault: !!row.isDefault,
        createdAt: row.createdAt
    };
}

export async function getAllCategories(): Promise<Category[]> {
    const res = await executeSqlAsync('SELECT * FROM categories ORDER BY isDefault DESC, name ASC');
    const rows = (res as any).rows as any;
    const out: Category[] = [];
    for (let i = 0; i < rows.length; i++) out.push(rowToCategory(rows.item(i)));
    return out;
}

export async function getCategoryById(id: string): Promise<Category | null> {
    const res = await executeSqlAsync('SELECT * FROM categories WHERE id = ? LIMIT 1', [id]);
    const rows = (res as any).rows as any;
    if (rows.length === 0) return null;
    return rowToCategory(rows.item(0));
}

function generateId() {
    return 'cat_' + Date.now().toString() + Math.random().toString(36).slice(2, 8);
}

export async function createCategory(data: Partial<Category>): Promise<Category> {
    const id = data.id ?? generateId();
    const now = new Date().toISOString();
    await executeSqlAsync(
        'INSERT INTO categories (id, name, color, isDefault, createdAt) VALUES (?, ?, ?, ?, ?)',
        [
            id,
            data.name || '',
            data.color || null,
            data.isDefault ? 1 : 0,
            now
        ]
    );
    return getCategoryById(id) as Promise<Category>;
}

export async function updateCategory(id: string, updates: Partial<Category>): Promise<Category | null> {
    const existing = await getCategoryById(id);
    if (!existing) return null;

    // Prevent updating default categories' isDefault flag
    const merged = { ...existing, ...updates };
    if (existing.isDefault) {
        merged.isDefault = true;
    }

    await executeSqlAsync(
        'UPDATE categories SET name=?, color=?, isDefault=? WHERE id=?',
        [merged.name, merged.color ?? null, merged.isDefault ? 1 : 0, id]
    );
    return getCategoryById(id);
}

export async function deleteCategory(id: string): Promise<void> {
    // Check if it's a default category
    const category = await getCategoryById(id);
    if (category?.isDefault) {
        throw new Error('Cannot delete default categories');
    }

    // When a category is deleted, tasks will have their category_id set to NULL due to ON DELETE SET NULL
    await executeSqlAsync('DELETE FROM categories WHERE id = ?', [id]);
}

export async function getDefaultCategory(): Promise<Category | null> {
    const res = await executeSqlAsync('SELECT * FROM categories WHERE id = ? LIMIT 1', ['cat_personal']);
    const rows = (res as any).rows as any;
    if (rows.length === 0) return null;
    return rowToCategory(rows.item(0));
}
