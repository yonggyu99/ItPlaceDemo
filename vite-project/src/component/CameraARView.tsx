import React, { useEffect, useRef, useState } from 'react';
import { membershipStores } from '../assets/membershipData';

interface Coords {
  latitude: number;
  longitude: number;
}

const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a = Math.sin(Δφ / 2) ** 2 +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const CameraARView: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [coords, setCoords] = useState<Coords | null>(null);
  const [angle, setAngle] = useState<number>(0);
  const [visibleStores, setVisibleStores] = useState<any[]>([]);

  useEffect(() => {
    navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ latitude, longitude });
        console.log('📍 위치 갱신됨:', latitude, longitude);
      },
      (err) => console.error('위치 오류', err),
      { enableHighAccuracy: true, maximumAge: 1000 }
    );

    const handleOrientation = (e: DeviceOrientationEvent) => {
      const heading = typeof e.webkitCompassHeading === 'number'
        ? e.webkitCompassHeading
        : e.alpha !== null ? 360 - e.alpha : 0;

      setAngle(heading);
    };

    if (
      window.DeviceOrientationEvent &&
      typeof window.DeviceOrientationEvent.requestPermission === 'function'
    ) {
      window.DeviceOrientationEvent.requestPermission()
        .then((res) => {
          if (res === 'granted') {
            window.addEventListener('deviceorientation', handleOrientation, true);
          }
        })
        .catch(console.error);
    } else {
      window.addEventListener(
        'deviceorientationabsolute' in window ? 'deviceorientationabsolute' : 'deviceorientation',
        handleOrientation,
        true
      );
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  useEffect(() => {
    if (!coords) return;

    const results = membershipStores.filter((store) => {
      const dist = getDistance(coords.latitude, coords.longitude, store.lat, store.lng);
      const storeAngle = Math.atan2(
        store.lng - coords.longitude,
        store.lat - coords.latitude
      ) * (180 / Math.PI);

      const storeAngle360 = (storeAngle + 360) % 360;
      const diff = Math.abs(angle - storeAngle360);
      const angleDiff = Math.min(diff, 360 - diff);

      console.log(`🔍 ${store.name} 거리: ${dist.toFixed(1)}m | 각도차: ${angleDiff.toFixed(1)}°`);

      if (dist <= 1000 && angleDiff <= 60) {
        console.log('✅ 표시됨:', store.name);
        return true;
      } else {
        console.log('⛔ 제외됨:', store.name);
        return false;
      }
    });

    setVisibleStores(results);
  }, [coords, angle]);

  useEffect(() => {
    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        console.error('카메라 접근 실패', err);
      }
    };

    initCamera();
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <video ref={videoRef} autoPlay playsInline muted style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 1
      }} />

      {/* ✅ 현재 방향 표시 */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        color: '#fff',
        padding: '6px 12px',
        borderRadius: '12px',
        fontSize: '14px',
        zIndex: 20
      }}>
        📍 현재 방향: {angle.toFixed(1)}°
      </div>

      {visibleStores.map((store, i) => (
        <div key={i} style={{
          position: 'absolute',
          top: `${60 + i * 60}px`,
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#ff567a',
          color: '#fff',
          padding: '8px 12px',
          borderRadius: '8px',
          fontSize: '14px',
          zIndex: 10
        }}>
          <strong>{store.name}</strong><br />
          혜택: {store.benefit}
        </div>
      ))}
    </div>
  );
};

export default CameraARView;
