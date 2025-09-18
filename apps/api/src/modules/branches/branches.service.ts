import { Injectable } from '@nestjs/common';

export interface Branch {
  id: string;
  name: string;
}

@Injectable()
export class BranchesService {
  private readonly branches: Branch[] = [
    { id: 'dps-main', name: 'Delhi Public School - Main Campus' },
    { id: 'dps-north', name: 'Delhi Public School - North Campus' },
    { id: 'dps-south', name: 'Delhi Public School - South Campus' },
    { id: 'dps-east', name: 'Delhi Public School - East Campus' },
    { id: 'dps-west', name: 'Delhi Public School - West Campus' },
    { id: 'kvs-central', name: 'Kendriya Vidyalaya - Central Branch' },
    { id: 'kvs-cantonment', name: 'Kendriya Vidyalaya - Cantonment Branch' },
    { id: 'kvs-airport', name: 'Kendriya Vidyalaya - Airport Branch' },
    { id: 'sps-primary', name: 'St. Paul\'s School - Primary Wing' },
    { id: 'sps-secondary', name: 'St. Paul\'s School - Secondary Wing' },
    { id: 'sps-senior', name: 'St. Paul\'s School - Senior Wing' },
    { id: 'ris-main', name: 'Ryan International School - Main Branch' },
    { id: 'ris-extension', name: 'Ryan International School - Extension Branch' },
  ];

  /**
   * Get all branches in React Admin data provider format
   * Returns { data: Branch[], total: number }
   */
  async getList(): Promise<{ data: Branch[]; total: number }> {
    return {
      data: this.branches,
      total: this.branches.length,
    };
  }

  /**
   * Get single branch by ID in React Admin data provider format
   * Returns { data: Branch }
   */
  async getOne(id: string): Promise<{ data: Branch }> {
    const branch = this.branches.find(b => b.id === id);
    if (!branch) {
      throw new Error(`Branch with id ${id} not found`);
    }
    return { data: branch };
  }

  /**
   * Get multiple branches by IDs in React Admin data provider format
   * Returns { data: Branch[] }
   */
  async getMany(ids: string[]): Promise<{ data: Branch[] }> {
    const filteredBranches = this.branches.filter(branch => ids.includes(branch.id));
    return { data: filteredBranches };
  }
}