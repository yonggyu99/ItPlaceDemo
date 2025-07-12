// CameraARView.tsx
import React, { useEffect, useState } from 'react';
import { membershipStores } from '../assets/membershipData';

const CameraARView: React.FC = () => {
  const [step, setStep] = useState<'intro' | 'loading' | 'ready'>('intro');
  const [debugLogs, setDebugLogs] = useState<string[]>([]);

  const appendLog = (msg: string) => {
    setDebugLogs((prev) => [...prev.slice(-10), msg]);
  };

  const handleStart = async () => {
    appendLog('🔄 사용자 액션으로 권한 요청 시작');
    setStep('loading');

    if (
      typeof DeviceOrientationEvent !== 'undefined' &&
      typeof DeviceOrientationEvent.requestPermission === 'function'
    ) {
      try {
        const permission = await DeviceOrientationEvent.requestPermission();
        if (permission === 'granted') {
          appendLog('✅ 기기 방향 권한 승인');
          setStep('ready');
        } else {
          appendLog('❌ 권한 거부');
          setStep('intro');
        }
      } catch (err: any) {
        appendLog(`❌ 권한 요청 오류: ${err.message}`);
        setStep('intro');
      }
    } else {
      appendLog('ℹ️ 권한 요청 불필요 (Android)');
      setStep('ready');
    }
  };

  useEffect(() => {
    appendLog('📱 AR 페이지 진입');
  }, []);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      {step === 'intro' && (
        <button
          onClick={handleStart}
          style={{
            position: 'absolute',
            top: '40%',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 999,
            padding: '12px 24px',
            fontSize: '18px',
            backgroundColor: '#ff567a',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
          }}
        >
          AR 보기 시작하기
        </button>
      )}

      {step === 'loading' && (
        <div
          style={{
            color: 'white',
            background: 'black',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
          }}
        >
          권한 요청 중입니다...
        </div>
      )}

      {step === 'ready' && (
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
