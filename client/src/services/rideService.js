import api from './api';

export const createRide = (data) => api.post('/rides', data);
export const getRides = (params) => api.get('/rides', { params });
export const getRideById = (id) => api.get(`/rides/${id}`);
export const updateRide = (id, data) => api.patch(`/rides/${id}`, data);
export const cancelRide = (id) => api.delete(`/rides/${id}`);
export const getMyRides = () => api.get('/rides/user/my');

export const createRequest = (rideId, data) =>
  api.post(`/rides/${rideId}/requests`, data);

export const getSentRequests = () => api.get('/requests/sent');
export const getReceivedRequests = () => api.get('/requests/received');
export const updateRequest = (requestId, data) =>
  api.patch(`/requests/${requestId}`, data);
