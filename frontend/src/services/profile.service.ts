import api from './auth.service';

export const getProfile = async () => {
    const response = await api.get('/profile');
    return response.data.data;
};

export const updateProfile = async (data: {
    full_name?: string;
    phone?: string;
    email?: string;
    gaushala_name?: string;
    gaushala_address?: string;
    registration_number?: string;
    establishment_year?: number;
    ownership_type?: string;
}) => {
    const response = await api.put('/profile', data);
    return response.data;
};

export const changePassword = async (data: {
    current_password: string;
    new_password: string;
}) => {
    const response = await api.put('/profile/password', data);
    return response.data;
};

export const uploadProfilePhoto = async (file: File) => {
    const formData = new FormData();
    formData.append('profileImage', file);
    const response = await api.post('/profile/photo', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};
