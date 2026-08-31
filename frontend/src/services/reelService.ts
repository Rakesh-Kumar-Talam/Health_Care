import API from "./api";

export const reelService = {
  getReels: async (params?: Record<string, any>) => {
    const res = await API.get("/reels", { params });
    return res.data;
  },
  getReelById: async (id: string) => {
    const res = await API.get(`/reels/${id}`);
    return res.data;
  },
  createReel: async (data: any) => {
    const res = await API.post("/reels", data);
    return res.data;
  },
  updateReel: async (id: string, data: any) => {
    const res = await API.put(`/reels/${id}`, data);
    return res.data;
  },
  deleteReel: async (id: string) => {
    const res = await API.delete(`/reels/${id}`);
    return res.data;
  },
  toggleLike: async (id: string) => {
    const res = await API.post(`/reels/${id}/like`);
    return res.data;
  },
  addComment: async (id: string, text: string) => {
    const res = await API.post(`/reels/${id}/comment`, { text });
    return res.data;
  },
};