import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, FileText } from 'lucide-react';
import { useLocation } from "react-router-dom";
import ZoomMtgEmbedded from "@zoom/meetingsdk/embedded";

// Dummy notification data
const dummyNotifications = [
  {
    id: 1,
    time: '10:15 AM',
    message: 'Silence detected. Here\'s a question to engage the group: What are your thoughts on the current project timeline?'
  }
];


const MeetingRoom = () => {
  const location = useLocation();
  const client = ZoomMtgEmbedded.createClient();
  const meetingSDKRef = useRef<HTMLDivElement | null>(null); // Reference for the Zoom container
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const { 
    meeting_url,meeting_id, userName, password, zak, meetingTopic, 
    questionType, silenceDetectionTime, signature, sdkKey 
  } = location.state || {}; // Get passed state

  const [showSummary, setShowSummary] = useState(false);


  useEffect(() => {
    if (meetingSDKRef.current) {
      const { clientWidth, clientHeight } = meetingSDKRef.current;
      console.log(signature, meeting_id, password, userName, zak)
      startMeeting(signature, meeting_id, password, userName, zak,clientHeight,clientWidth);
      console.log('here')
    }
  }, [meeting_url,meeting_id, userName, password, zak, meetingTopic, questionType, silenceDetectionTime, signature, sdkKey]);

  async function startMeeting(signature: string, meetingNumber: any, passWord: any, userName: any, zak: any,height:number,width:number) {
    if (!meetingSDKRef.current) {
      console.error("Meeting container not available!");
      return;
    }

    try {
      await client.init({
        zoomAppRoot: meetingSDKRef.current,
        language: "en-US",
        patchJsMedia: true,
        leaveOnPageUnload: true,
        customize:{

          meeting:{
            popper:{
              placement:'top-start',
              disableDraggable:false
            }
          },
          video:{
            viewSizes:{
              default:{
                height: height-150,
                width: width,
              }
            }
          }
        }
      });

      await client.join({
        signature: signature,
        sdkKey: sdkKey,
        meetingNumber: meetingNumber,
        password: passWord,
        userName: userName,
        tk: '',
        zak: zak,
      });
      
      console.log("Zoom meeting started successfully!");
      connectToSocket()
    } catch (error) {
      console.error("Error joining meeting:", error);
    }
  }

  useEffect(() => {
    if(socket){
      const host=false
      const join_url=meeting_url
      const silence_duration=silenceDetectionTime
      const icebreaker_mode=questionType
      console.log(host,join_url,silence_duration,icebreaker_mode);
    }
  },[socket])
  async function connectToSocket(){
    setSocket(new WebSocket('ws://localhost:8001'))
      // // Event listener for when the WebSocket connection is opened
      // socket.addEventListener('open', (event) => {
      //   if(host==true){
      //     const message={
      //       action:"connection",
      //       meeting_id:meetingNumber,
      //       user:'host',
      //       join_url:join_url,
      //       silence_duration:silence_duration,
      //       icebreaker_mode: icebreaker_mode === 'common' ? 0 : 'context'
      //     }
      //     socket.send(JSON.stringify(message))
      //   }else{
      //     const message={
      //       action:"connection",
      //       meeting_id:meetingNumber,
      //       user:'participant'
      //     }
      //     socket.send(JSON.stringify(message))
      //   }
      // });
  
      // // Event listener for receiving a message from the server
      // socket.addEventListener('message', (event) => {
      //   console.log('Message from server:', event.data);
      //   let message = JSON.parse(event.data)
      //   if(message['action'] == 'notify'){
      //     // appendMessage(message['message'])
      //     // if('excercise' in message){
      //     //   excercise_markdown = message['excercise']
      //     //   addToExcercise(excercise_markdown)
      //     // }
      //   }
  
      //   // document.getElementById('response').textContent = 'Server says: ' + event.data;
      // });
  
      // // Event listener for any WebSocket errors
      // socket.addEventListener('error', (event) => {
      //   console.error('WebSocket error:', event);
      // });
  
      // // Event listener for when the WebSocket connection is closed
      // socket.addEventListener('close', (event) => {
      //   console.log('WebSocket connection closed');
      // });
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Left side - Zoom Meeting Window */}
      <div className="flex-1 bg-gray-900 p-4">
        <div ref={meetingSDKRef} className="h-full flex items-center justify-center">
          {/* Zoom SDK will render here */}
        </div>
      </div>

      {/* Right side - Notification Panel */}
      <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center">
              <MessageCircle className="w-5 h-5 mr-2 text-blue-600" />
              Assistant Feed
            </h2>
            <button
              onClick={() => setShowSummary(!showSummary)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200 flex items-center"
            >
              <FileText className="w-4 h-4 mr-2" />
              Get Summary
            </button>
          </div>
        </div>

        {/* Notifications Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {showSummary ? (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Meeting Summary</h3>
              <p className="text-sm text-gray-700">
                Key points discussed:
                <ul className="list-disc ml-4 mt-2">
                  <li>Project timeline review</li>
                  <li>Team engagement improvements</li>
                  <li>Solution proposals and feedback</li>
                </ul>
              </p>
            </div>
          ) : (
            dummyNotifications.map(notification => (
              <div key={notification.id} className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-500 mb-1">{notification.time}</div>
                <p className="text-gray-700">{notification.message}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default MeetingRoom;
