import api from './auth.service';

export const getProductionLogs = async (params?: {
    start_date?: string;
    end_date?: string;
    product_type?: string;
    page?: number;
    limit?: number;
}) => {
    const response = await api.get('/production/logs', { params });
    return response.data;
};

export const createProductionLog = async (data: {
    product_type: string;
    quantity: number;
    unit: string;
    production_date: string;
    notes?: string;
}) => {
    const response = await api.post('/production/logs', data);
    return response.data;
};

export const getProductionStats = async () => {
    const response = await api.get('/production/stats');
    return response.data;
};


export const updateProductionLog = async (id: string, data: any) => {
    const response = await api.put(`/production/logs/${id}`, data);
    return response.data;
};

export const deleteProductionLog = async (id: string) => {
    const response = await api.delete(`/production/logs/${id}`);
    return response.data;
};
