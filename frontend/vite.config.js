import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  // Dev proxy removed — axiosInstance uses VITE_API_BASE_URL for the full
  // backend URL in both dev and production. The /api prefix is already
  // part of the backend route mapping (e.g. /api/jobs), so no proxy needed.
})
