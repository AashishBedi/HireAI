import axiosInstance from './axiosInstance'

export const applyToJob = (jobId) =>
    axiosInstance.post(`/applications/${jobId}`)

export const getMyApplications = () =>
    axiosInstance.get('/applications/my')

export const getJobApplications = (jobId) =>
    axiosInstance.get(`/applications/job/${jobId}`)

export const updateApplicationStatus = (id, status) =>
    axiosInstance.patch(`/applications/${id}/status?status=${status}`)