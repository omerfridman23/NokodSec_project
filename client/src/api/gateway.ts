import axios, { type AxiosResponse } from 'axios';
import type { Automation } from '@sharedTypes/types';

const BE_URL = import.meta.env.VITE_SERVER_URL;

class Gateway {
  static async get<T>(path: string): Promise<AxiosResponse<T>> {
    const res = await axios.get<T>(`${BE_URL}/${path}`);
    return res;
  }

  static async getAutomations(page: number, pageSize: number): Promise<AxiosResponse<Automation[]>> {
    const automations = await Gateway.get<Automation[]>(`automations?page=${page}&pageSize=${pageSize}`);
    return automations;
  }
}

export default Gateway;
