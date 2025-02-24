import React, { useEffect,useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, User, ReceiptRussianRuble } from "lucide-react";

const LoginPage = () => {
  const navigate = useNavigate();
  const [meetingLink, setMeetingLink] = useState('');
  const [guestUsername, setGuestUsername] = useState("");


  const handleGuestJoin = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!meetingLink || !guestUsername){
        alert("Please enter the meeting join URL and Username");
        return;
      }
      try {
        const response = await fetch("http://localhost:8000/guest_join", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            joinUrl:meetingLink,
            username:guestUsername
          }),
        });
  
        const data = await response.json();
        console.log(data);
        if (response.ok) {
          const meeting_url = meetingLink
          const meeting_id = data.meeting_id
          const userName=guestUsername
          const password = data.password
          const signature = data.signature
          const sdkKey = data.sdkKey
          navigate('/meeting-room', {
            state: { host:false,meeting_url,meeting_id,userName,password, zak:'' ,meetingTopic:'',questionType:'',silenceDetectionTime:'',signature,sdkKey}, // Pass data as state
          });
        } else {
          let error = JSON.parse(data.detail.replace(/'/g, '"'))
          if(error['code'] == 124){
            // delete access token and redirect to the home page
            localStorage.clear()
            navigate('/')
          }
          alert(`Error creating meeting: ${error.message}`);
        }
        
      } catch (error) {
        console.error("Error creating meeting:", error);
        alert("Failed to create meeting.");
      }
  }
  
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
  <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-sky-50 to-sky-200 p-4 space-y-6">
  <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
    <div className="flex items-center mb-4">
      <User className="w-6 h-6 text-blue-600 mr-2" />
      <h2 className="text-xl font-semibold">Login with Zoom</h2>
    </div>
    <form onSubmit={handleLoginWithZoom} className="space-y-4">
      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200"
      >
        Login with Zoom
      </button>
    </form>
  </div>

  <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
        <div className="flex items-center mb-4">
          <User className="w-6 h-6 text-green-600 mr-2" />
          <h2 className="text-xl font-semibold">Join as Guest</h2>
        </div>
        <form onSubmit={handleGuestJoin} className="space-y-4">
          <div>
            <label htmlFor="guestUsername" className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              id="guestUsername"
              value={guestUsername}
              onChange={(e) => setGuestUsername(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="meetingLinkGuest" className="block text-sm font-medium text-gray-700 mb-1">
              Meeting Link
            </label>
            <input
              type="text"
              id="meetingLinkGuest"
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
              placeholder="Enter Zoom meeting link"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition duration-200"
          >
            Join as Guest
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
