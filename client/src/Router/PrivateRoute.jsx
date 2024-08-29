import { useContext } from "react";
import { AuthContext } from "../Providers/AuthProvider";
import { useNavigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  if (loading) {
    return <p>Loading please wait....</p>;
  }

  if (user) {
    return children;
  }

  return navigate("/login");
};

export default PrivateRoute;
