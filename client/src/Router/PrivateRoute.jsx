import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../Hook/useAuth";

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <p>Loading please wait....</p>;
  }

  if (user) {
    return children;
  }

  return <Navigate to={"/login"} state={location.pathname} replace />;
};

export default PrivateRoute;
