import axios, { type AxiosResponse } from 'axios';
import type { Automation } from '@sharedTypes/types';

const BE_URL = import.meta.env.VITE_SERVER_URL;

export interface SortOrder {
  column: keyof Automation;
  direction: 'ASC' | 'DESC';
}

class Gateway {
  static async get<T>(path: string): Promise<AxiosResponse<T>> {
    const res = await axios.get<T>(`${BE_URL}/${path}`);
    return res;
  }

  static async getAutomations(
    page: number, 
    pageSize: number, 
    sortOrders?: SortOrder[]
  ): Promise<AxiosResponse<{ data: Automation[], total: number }>> {
    let url = `automations?page=${page}&pageSize=${pageSize}`;
    
    if (sortOrders && sortOrders.length > 0) {
      url += `&sort=${encodeURIComponent(JSON.stringify(sortOrders))}`;
    }
    
    const automations = await Gateway.get<{ data: Automation[], total: number }>(url);
    return automations;
  }
}

export default Gateway;
