import React, { useEffect, useState } from 'react';
import { membershipStores } from '../assets/membershipData';

const CameraARView: React.FC = () => {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);

  const appendLog = (msg: string) => {
    setDebugLogs((prev) => [...prev.slice(-10), msg]);
  };

  useEffect(() => {
    const checkPermission = async () => {
      if (
        typeof DeviceOrientationEvent !== 'undefined' &&
        typeof DeviceOrientationEvent.requestPermission === 'function'
      ) {
        try {
          const permission = await DeviceOrientationEvent.requestPermission();
          if (permission === 'granted') {
            appendLog('✅ Device orientation permission granted');
            setPermissionGranted(true);
          } else {
            appendLog('❌ Permission denied');
          }
        } catch (err: any) {
          appendLog(`❌ Permission error: ${err.message}`);
        }
      } else {
        appendLog('ℹ️ Permission not required (non-iOS)');
        setPermissionGranted(true);
      }
    };

    checkPermission();
  }, []);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      {permissionGranted ? (
        <a-scene
          vr-mode-ui="enabled: false"
          embedded
          arjs="sourceType: webcam; debugUIEnabled: false;"
          renderer="logarithmicDepthBuffer: true;"
        >
          {membershipStores.map((store, idx) => (
            <a-entity
              key={idx}
              gps-entity-place={`latitude: ${store.lat}; longitude: ${store.lng};`}
              text={`value: ${store.name}\n혜택: ${store.benefit}; color: #ff567a; align: center; width: 6`}
              position="0 0 0"
              scale="20 20 20"
            ></a-entity>
          ))}
          <a-camera gps-camera rotation-reader></a-camera>
        </a-scene>
      ) : (
        <div
          style={{
            color: 'white',
            background: 'black',
            width: '100%',
            height: '100%',
            padding: '20px',
          }}
        >
          권한 요청 중입니다...
        </div>
      )}

      {/* 디버깅 로그 */}
      <div
        style={{
          position: 'absolute',
          bottom: 10,
          left: 10,
          right: 10,
          background: 'rgba(0,0,0,0.7)',
          color: '#0f0',
          fontSize: '12px',
          padding: '8px',
          maxHeight: '30vh',
          overflowY: 'auto',
          zIndex: 9999,
          whiteSpace: 'pre-wrap',
          borderRadius: '8px',
        }}
      >
        {debugLogs.map((log, i) => (
          <div key={i}>{log}</div>
        ))}
      </div>
    </div>
  );
};

export default CameraARView;
