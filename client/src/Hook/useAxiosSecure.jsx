import axios from "axios";
import useAuth from "./useAuth";
import { useNavigate } from "react-router-dom";

const axiosSecure = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

const useAxiosSecure = () => {
  const { logOut } = useAuth();
  const navigate = useNavigate();
  // working with interceptor

  // response interceptor
  axiosSecure.interceptors.response.use(
    (res) => {
      console.log(`I am checking your error from axios interceptor`, res);
      return res;
    },
    async (err) => {
      await logOut();
      navigate("/login");
      return Promise.reject(err);
    }
  );

  // request interceptor

  return axiosSecure;
};

export default useAxiosSecure;
