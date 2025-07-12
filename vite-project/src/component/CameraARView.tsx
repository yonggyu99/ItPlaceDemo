// src/components/CameraARView.tsx
import React, { useEffect } from 'react';
import { membershipStores } from '../assets/membershipData';

// AFRAME과 AR.js를 사용할 수 있게 types 보완 (ts-ignore 활용)
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'a-scene': any;
      'a-entity': any;
      'a-camera': any;
    }
  }
}

const CameraARView: React.FC = () => {
  useEffect(() => {
    const requestOrientationPermission = async () => {
      if (
        typeof DeviceOrientationEvent !== 'undefined' &&
        typeof DeviceOrientationEvent.requestPermission === 'function'
      ) {
        try {
          const permission = await DeviceOrientationEvent.requestPermission();
          if (permission !== 'granted') {
            alert('디바이스 방향 접근 권한이 필요합니다.');
          }
        } catch (e) {
          console.error('Orientation 권한 요청 실패', e);
        }
      }
    };

    requestOrientationPermission();
  }, []);

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      <a-scene
        vr-mode-ui="enabled: false"
        embedded
        arjs="sourceType: webcam; debugUIEnabled: false;"
        renderer="logarithmicDepthBuffer: true;"
        device-orientation-permission-ui="enabled: true"
        style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
      >
        {/* 🧭 각 매장에 대한 GPS 기반 AR 오버레이 */}
        {membershipStores.map((store, idx) => (
          <a-entity
            key={idx}
            gps-entity-place={`latitude: ${store.lat}; longitude: ${store.lng};`}
            text={`value: ${store.name}\n혜택: ${store.benefit}; color: #ff567a; align: center; width: 6`}
            position="0 0 0"
            scale="20 20 20"
          ></a-entity>
        ))}

        {/* 📷 카메라 및 회전 센서 */}
        <a-camera gps-camera rotation-reader></a-camera>
      </a-scene>
    </div>
  );
};

export default CameraARView;
