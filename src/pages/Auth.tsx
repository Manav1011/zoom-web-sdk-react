import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const navigate = useNavigate();
  const fetchAccessToken = async (code: string) => {
    try {
      const response = await fetch(`http://localhost:8000/access?code=${code}`);
      const data = await response.json();

      if (data.access_token) {
        localStorage.setItem("access_token", data.access_token);
        navigate("/home"); // Redirect after storing token
      } else {
        console.error("Failed to get access token:", data);
      }
    } catch (error) {
      console.error("Error fetching access token:", error);
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (code) {
      fetchAccessToken(code);
    } else {
      const token = localStorage.getItem("access_token");
      if (token) {
        navigate("/home");
      }
    }
  }, [navigate]);

  const handleLoginWithZoom = async () => {
    try {
        const response = await fetch("http://localhost:8000/oauth/login");
        const data = await response.json();
    
        if (data.redirect_url) {
          window.location.href = data.redirect_url;
        } else {
          console.error("No redirect URL received from server");
        }
      } catch (error) {
        console.error("Error during Zoom login:", error);
      }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <button
        onClick={handleLoginWithZoom}
        className="bg-blue-600 text-white px-6 py-3 rounded-xl text-lg font-semibold hover:bg-blue-700 transition duration-200"
      >
        Login with Zoom
      </button>
    </div>
  );
};

export default LoginPage;
