import React, { useEffect } from 'react';
import { membershipStores } from '../assets/membershipData';

const CameraARView: React.FC = () => {
  useEffect(() => {
    const checkPermission = async () => {
      if (
        typeof DeviceOrientationEvent !== 'undefined' &&
        typeof DeviceOrientationEvent.requestPermission === 'function'
      ) {
        try {
          const permissionState = await DeviceOrientationEvent.requestPermission();
          if (permissionState === 'granted') {
            console.log('📱 Device orientation permission granted');
          } else {
            console.warn('❌ Device orientation permission denied');
          }
        } catch (err) {
          console.error('⚠️ Device orientation error:', err);
        }
      }
    };

    checkPermission();
  }, []);

  return (
    <div>
      <a-scene
        vr-mode-ui="enabled: false"
        embedded
        arjs="sourceType: webcam; debugUIEnabled: false;"
        renderer="logarithmicDepthBuffer: true;"
        device-orientation-permission-ui="enabled: true"
      >
        {/* 오버레이: membership store 텍스트 */}
        {membershipStores.map((store, idx) => (
          <a-entity
            key={idx}
            gps-entity-place={`latitude: ${store.lat}; longitude: ${store.lng};`}
            text={`value: ${store.name}\n혜택: ${store.benefit}; color: #ff567a; align: center; width: 6`}
            position="0 0 0"
            scale="20 20 20"
          ></a-entity>
        ))}

        {/* 카메라 (GPS 기반) */}
        <a-camera gps-camera rotation-reader></a-camera>
      </a-scene>
    </div>
  );
};

export default CameraARView;
