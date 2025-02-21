import React, { useState } from "react";
import { Clock, MessageSquare, Lock, Type } from "lucide-react";
import { useNavigate } from 'react-router-dom';

const HostConfiguration = () => {
  const navigate = useNavigate();
  const [config, setConfig] = useState({
    silenceDetectionTime: 10,
    questionType: "topic",
    meetingTopic: "",
    meetingPassword: "",
    userName:""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const accessToken = localStorage.getItem("access_token");

    if (!accessToken) {
      alert("User is not authenticated. Please log in.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/create_meeting", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          silenceDetectionTime: config.silenceDetectionTime,
          questionType: config.questionType,
          meetingTopic: config.meetingTopic,
          meetingPassword: config.meetingPassword,
          accessToken:accessToken,
          userName:config.userName
        }),
      });

      const data = await response.json();
      console.log(response)
      if (response.ok) {
        const meeting_url = data.meeting_url
        const meeting_id = data.meeting_id
        const userName=data.userName
        const password = data.password
        const zak= data.zak
        const meetingTopic = data.meetingTopic 
        const questionType = data.questionType 
        const silenceDetectionTime = data.silenceDetectionTime
        const signature = data.signature
        const sdkKey = data.sdkKey
        // console.log(join_url,zak,meetingTopic,questionType,silenceDetectionTime)

        navigate('/meeting-room', {
          
          state: { meeting_url,meeting_id,userName,password, zak ,meetingTopic,questionType,silenceDetectionTime,signature,sdkKey}, // Pass data as state
        });
      } else {
        alert(`Error creating meeting: ${data.detail}`);
      }
    } catch (error) {
      console.error("Error creating meeting:", error);
      alert("Failed to create meeting.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-8">Host Configuration</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Meeting Topic */}
          <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center">
              <Type className="w-5 h-5 mr-2 text-blue-600" />
              Username
            </h2>
            <input
              type="text"
              value={config.userName}
              onChange={(e) => setConfig({ ...config, userName: e.target.value })}
              placeholder="Enter meeting topic"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <h2 className="text-lg font-semibold flex items-center">
              <Type className="w-5 h-5 mr-2 text-blue-600" />
              Meeting Topic
            </h2>
            <input
              type="text"
              value={config.meetingTopic}
              onChange={(e) => setConfig({ ...config, meetingTopic: e.target.value })}
              placeholder="Enter meeting topic"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Meeting Password */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center">
              <Lock className="w-5 h-5 mr-2 text-blue-600" />
              Meeting Password
            </h2>
            <input
              type="password"
              value={config.meetingPassword}
              onChange={(e) => setConfig({ ...config, meetingPassword: e.target.value })}
              placeholder="Set a password for the meeting"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Silence Detection */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center">
              <Clock className="w-5 h-5 mr-2 text-blue-600" />
              Silence Detection
            </h2>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Detection Time (seconds)
            </label>
            <input
              type="number"
              value={config.silenceDetectionTime}
              onChange={(e) =>
                setConfig({ ...config, silenceDetectionTime: parseInt(e.target.value) })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="1"
              required
            />
          </div>

          {/* Question Type */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center">
              <MessageSquare className="w-5 h-5 mr-2 text-blue-600" />
              Question Type
            </h2>
            <div className="space-y-2">
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  value="topic"
                  checked={config.questionType === "topic"}
                  onChange={(e) => setConfig({ ...config, questionType: e.target.value })}
                  className="form-radio text-blue-600"
                />
                <span>Topic-related Questions</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  value="icebreaker"
                  checked={config.questionType === "icebreaker"}
                  onChange={(e) => setConfig({ ...config, questionType: e.target.value })}
                  className="form-radio text-blue-600"
                />
                <span>Icebreaker Questions</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200"
          >
            Start Meeting
          </button>
        </form>
      </div>
    </div>
  );
};

export default HostConfiguration;
