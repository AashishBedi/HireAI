import axiosInstance from './axiosInstance'

export const getJobs = (page = 0, size = 10) =>
  axiosInstance.get(`/jobs?page=${page}&size=${size}`)

export const searchJobs = (skill = '', location = '') =>
  axiosInstance.get(`/jobs/search?skill=${encodeURIComponent(skill)}&location=${encodeURIComponent(location)}`)

export const getJobById = (id) =>
  axiosInstance.get(`/jobs/${id}`)

export const postJob = (data) =>
  axiosInstance.post('/jobs', data)

export const updateJobStatus = (id, status) =>
  axiosInstance.patch(`/jobs/${id}/status?status=${status}`)
