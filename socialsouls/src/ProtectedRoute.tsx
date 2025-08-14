import { Navigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase/firebaseConfig"; 



export default function ProtectedRoute({ children }: any) {

  const [user, loading] = useAuthState(auth); 

  if (loading) return <h1>Loading...</h1>; 
  

  if (!user) {
    return <Navigate to="/" replace />; 
  }

  return children;
}
