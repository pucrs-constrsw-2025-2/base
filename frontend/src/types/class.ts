export interface Class {
  id?: string;
  name: string;
  year: number;
  semester: number;
  course_id?: string;
  code?: string;
  capacity?: number;
  [key: string]: any;
}

export interface Paginated<T> {
  page?: number;
  size?: number;
  total?: number;
  items: T[];
}

export default Class;
