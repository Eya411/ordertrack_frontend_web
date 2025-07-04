import { Admin } from './admin';

export interface AdminDisplay extends Admin {
    showPassword?: boolean;
    deleted_at?: string | null;
}