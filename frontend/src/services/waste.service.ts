import api from './auth.service';

export const getWasteLogs = async (params?: {
    start_date?: string;
    end_date?: string;
    page?: number;
    limit?: number;
}) => {
    const response = await api.get('/waste/logs', { params });
    return response.data;
};

export const createWasteLog = async (data: {
    waste_type: string;
    quantity: number;
    unit: string;
    collection_date: string;
    notes?: string;
}) => {
    const response = await api.post('/waste/logs', data);
    return response.data;
};

export const getWasteStats = async () => {
    const response = await api.get('/waste/stats');
    return response.data;
};


export const updateWasteLog = async (id: string, data: any) => {
    const response = await api.put(`/waste/logs/${id}`, data);
    return response.data;
};

export const deleteWasteLog = async (id: string) => {
    const response = await api.delete(`/waste/logs/${id}`);
    return response.data;
};
