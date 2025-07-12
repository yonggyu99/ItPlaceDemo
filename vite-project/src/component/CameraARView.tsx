import React, { useEffect, useRef, useState } from 'react';
import { membershipStores } from '../assets/membershipData';

const toRad = (value: number) => (value * Math.PI) / 180;
const getBearing = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const dLon = toRad(lon2 - lon1);
  const y = Math.sin(dLon) * Math.cos(toRad(lat2));
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon);
  const bearing = (Math.atan2(y, x) * 180) / Math.PI;
  return (bearing + 360) % 360;
};

const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371e3;
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lon2 - lon1);
  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const CameraARView: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentHeading, setCurrentHeading] = useState<number | null>(null);
  const [currentPos, setCurrentPos] = useState<{ lat: number; lng: number } | null>(null);
  const [visibleStores, setVisibleStores] = useState<typeof membershipStores>([]);

  useEffect(() => {
    // 카메라 켜기
    navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' },
      audio: false,
    }).then((stream) => {
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    });

    // 위치 정보 가져오기
    navigator.geolocation.watchPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      setCurrentPos({ lat: latitude, lng: longitude });
    });

    // 방향(나침반) 정보
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.alpha !== null) {
        setCurrentHeading(e.alpha); // alpha: 북쪽 기준 회전각
      }
    };
    window.addEventListener('deviceorientationabsolute', handleOrientation, true);

    return () => {
      window.removeEventListener('deviceorientationabsolute', handleOrientation);
    };
  }, []);

  useEffect(() => {
    if (!currentHeading || !currentPos) return;

    const results = membershipStores.filter((store) => {
      const distance = getDistance(currentPos.lat, currentPos.lng, store.lat, store.lng);
      if (distance > 1000) return false; // 반경 200m 이내만

      const bearing = getBearing(currentPos.lat, currentPos.lng, store.lat, store.lng);
      const diff = Math.abs(bearing - currentHeading);
      return diff < 30 || diff > 330; // 앞쪽 시야(약 ±30도)
    });

    setVisibleStores(results);
  }, [currentHeading, currentPos]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover' }}
      />

      {visibleStores.map((store, idx) => (
        <div key={idx} style={{
          position: 'absolute',
          top: `${20 + idx * 60}px`,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(255, 86, 122, 0.9)',
          color: '#fff',
          padding: '8px 14px',
          borderRadius: '8px',
          fontSize: '14px',
        }}>
          <strong>{store.name}</strong><br />
          혜택: {store.benefit}
        </div>
      ))}
    </div>
  );
};

export default CameraARView;
