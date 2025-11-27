export interface Company {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'COMPANY_ADMIN' | 'SUPERVISOR' | 'COLLABORATOR';
  companyId?: number;
  teamId?: number;
  points: number;
  username?: string;
  profilePicture?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
  mustChangePassword?: boolean;
  team?: Team;
}

export interface Category {
  id: number;
  name: string;
  companyId: number;
}

export interface Item {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
  price: number;
  stock: number;
  companyId: number;
  categoryId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PointTransaction {
  id: number;
  userId: number;
  companyId: number;
  amount: number;
  type: string;
  description?: string;
  adminName?: string;
  createdAt: string;
}

export interface Elogio {
  id: number;
  message: string;
  fromId: number;
  toId: number;
  likes: number;
  createdAt: string;
}

export interface Team {
  id: number;
  name: string;
  description?: string;
  companyId: number;
  createdAt: string;
  updatedAt: string;
  supervisors?: User[];
  members?: User[];
  company?: Company;
}
