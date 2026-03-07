import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { JitsiMeeting } from '@jitsi/react-sdk';
import { useAuth } from '../contexts/AuthContext';
import { Phone } from 'lucide-react';

export default function VideoCall() {
  const { meetingId } = useParams<{ meetingId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const audioOnly = searchParams.get('audioOnly') === 'true';

  if (!meetingId) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <p>Invalid meeting link.</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-gray-900 flex flex-col">
      {/* Minimal header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-gray-800 text-white shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors"
        >
          <Phone className="w-4 h-4" />
          Leave call
        </button>
        <span className="text-gray-500 text-xs ml-auto">Room: {meetingId}</span>
      </div>

      {/* Jitsi iframe fills remaining space */}
      <div className="flex-1">
        <JitsiMeeting
          domain="meet.jit.si"
          roomName={meetingId}
          configOverwrite={{
            startWithAudioMuted: false,
            startWithVideoMuted: audioOnly,
            disableModeratorIndicator: true,
            startScreenSharing: false,
            enableEmailInStats: false,
            prejoinPageEnabled: false,
          }}
          interfaceConfigOverwrite={{
            DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
            MOBILE_APP_PROMO: false,
            SHOW_CHROME_EXTENSION_BANNER: false,
          }}
          userInfo={{
            displayName: user?.full_name || user?.email || 'Provider',
            email: user?.email || '',
          }}
          onReadyToClose={() => navigate(-1)}
          getIFrameRef={(iframeRef) => {
            iframeRef.style.height = '100%';
            iframeRef.style.width = '100%';
            iframeRef.style.border = 'none';
          }}
        />
      </div>
    </div>
  );
}
