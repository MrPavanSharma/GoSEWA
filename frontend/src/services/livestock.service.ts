import api from './auth.service';

export const getLivestock = async (params?: {
    status?: string;
    page?: number;
    limit?: number;
    search?: string;
    breed?: string;
}) => {
    const response = await api.get('/stock/livestock', { params });
    return response.data;
};

export const getLivestockById = async (id: string) => {
    const response = await api.get(`/stock/livestock/${id}`);
    return response.data;
};

export const createLivestock = async (data: {
    tag_id: string;
    type: string;
    breed?: string;
    age?: number;
    health_status?: string;
}) => {
    const response = await api.post('/stock/livestock', data);
    return response.data;
};

export const updateLivestock = async (id: string, data: any) => {
    const response = await api.put(`/stock/livestock/${id}`, data);
    return response.data;
};

export const deleteLivestock = async (id: string) => {
    const response = await api.delete(`/stock/livestock/${id}`);
    return response.data;
};

export const addHealthRecord = async (livestockId: string, data: {
    checkup_date: string;
    diagnosis: string;
    treatment?: string;
    vet_name?: string;
}) => {
    const response = await api.post(`/stock/livestock/${livestockId}/health`, data);
    return response.data;
};

export const getHealthRecords = async (livestockId: string) => {
    const response = await api.get(`/stock/livestock/${livestockId}/health`);
    return response.data;
};
