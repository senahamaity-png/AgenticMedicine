
import axios from "axios";

const api = axios.create({
  baseURL: "https://agenticmedicine.onrender.com/api"
});

export default api;
