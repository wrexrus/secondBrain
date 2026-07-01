import axios from 'axios';
import BASE_URL from '../config/api';

const getHeaders = (token) => ({
  headers: { Authorization: `Bearer ${token}` }
});

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const fetchCategoriesApi = async (token) => {
  const res = await axios.get(`${BASE_URL}/api/websites/categories`, getHeaders(token));
  return res.data;
};

export const fetchMetadataApi = async (token) => {
  const res = await axios.get(`${BASE_URL}/api/websites/metadata`, getHeaders(token));
  return res.data;
};

export const fetchWebsitesByCategoryApi = async (token, categoryName) => {
  const res = await axios.get(`${BASE_URL}/api/websites/${categoryName}`, getHeaders(token));
  return res.data;
};

export const deleteWebsiteApi = async (token, id) => {
  const res = await axios.delete(`${BASE_URL}/api/websites/${id}`, getHeaders(token));
  return res.data;
};

export const saveWebsiteApi = async (token, payload) => {
  const res = await axios.post(`${BASE_URL}/api/websites/save`, payload, getHeaders(token));
  return res.data;
};

export const saveMediaApi = async (token, payload) => {
  const res = await axios.post(`${BASE_URL}/api/websites/save-media`, payload, getHeaders(token));
  return res.data;
};

export const searchWebsitesApi = async (token, query) => {
  const res = await axios.get(`${BASE_URL}/api/websites/search?q=${query}`, getHeaders(token));
  return res.data;
};

export const updateWebsiteApi = async (token, id, payload) => {
  const res = await axios.put(`${BASE_URL}/api/websites/${id}`, payload, getHeaders(token));
  return res.data;
};
