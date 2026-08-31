import API from "./api";

export const postService = {
  getPosts: async (params?: Record<string, any>) => {
    const res = await API.get("/posts", { params });
    return res.data;
  },
  getPostById: async (id: string) => {
    const res = await API.get(`/posts/${id}`);
    return res.data;
  },
  createPost: async (data: any) => {
    const res = await API.post("/posts", data);
    return res.data;
  },
  updatePost: async (id: string, data: any) => {
    const res = await API.put(`/posts/${id}`, data);
    return res.data;
  },
  deletePost: async (id: string) => {
    const res = await API.delete(`/posts/${id}`);
    return res.data;
  },
  toggleLike: async (id: string) => {
    const res = await API.post(`/posts/${id}/like`);
    return res.data;
  },
  addComment: async (id: string, text: string) => {
    const res = await API.post(`/posts/${id}/comment`, { text });
    return res.data;
  },
};