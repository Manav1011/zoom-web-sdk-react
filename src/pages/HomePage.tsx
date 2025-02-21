import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Users } from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();
  const [meetingLink, setMeetingLink] = useState('');

  const handleParticipantJoin = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle participant join logic here
    console.log('Joining as participant with link:', meetingLink);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome to Smart Meeting Assistant</h1>
          <p className="text-lg text-gray-600">Choose how you'd like to join the meeting</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mt-8">
          {/* Join as Participant */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center mb-4">
              <Users className="w-6 h-6 text-blue-600 mr-2" />
              <h2 className="text-xl font-semibold">Join as Participant</h2>
            </div>
            <form onSubmit={handleParticipantJoin} className="space-y-4">
              <div>
                <label htmlFor="meetingLink" className="block text-sm font-medium text-gray-700 mb-1">
                  Meeting Link
                </label>
                <input
                  type="text"
                  id="meetingLink"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  placeholder="Enter Zoom meeting link"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200"
              >
                Join Meeting
              </button>
            </form>
          </div>

          {/* Join as Host */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center mb-4">
              <Video className="w-6 h-6 text-blue-600 mr-2" />
              <h2 className="text-xl font-semibold">Join as Host</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Configure your meeting settings and start with smart assistance
            </p>
            <button
              onClick={() => navigate('/host-config')}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition duration-200"
            >
              Configure & Start
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;