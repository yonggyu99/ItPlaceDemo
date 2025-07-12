import React, { useEffect, useRef, useState } from 'react';
import { membershipStores } from '../assets/membershipData';

declare global {
  interface Window {
    kakao: any;
  }
}

const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

const getStoresWithinRadius = (lat: number, lng: number, radius: number = 50) => {
  return membershipStores.filter((store) => {
    const dist = getDistance(lat, lng, store.lat, store.lng);
    return dist <= radius;
  });
};

const MapView = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const roadviewRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [showRoadview, setShowRoadview] = useState(false);
  const [isRoadviewMode, setIsRoadviewMode] = useState(false);
  const [pendingRoadviewLatLng, setPendingRoadviewLatLng] = useState<any>(null);
  const roadviewObjRef = useRef<any>(null); // ✅
  const currentOverlaysRef = useRef<any[]>([]); // ✅

  useEffect(() => {
    if (document.getElementById('kakao-map-script')) return;

    const script = document.createElement('script');
    script.id = 'kakao-map-script';
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${import.meta.env.VITE_KAKAO_API_KEY}&autoload=false&libraries=services`;
    script.onload = () => {
      window.kakao.maps.load(() => {
        const container = mapRef.current;
        const options = {
          center: new window.kakao.maps.LatLng(37.5665, 126.9780),
          level: 3,
        };

        const mapInstance = new window.kakao.maps.Map(container, options);
        setMap(mapInstance);

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            const loc = new window.kakao.maps.LatLng(lat, lng);
            mapInstance.setCenter(loc);
            console.log('[지도 초기화] 현재 위치:', lat, lng);
          });
        }
      });
    };
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!map) return;

    membershipStores.forEach((store) => {
      const marker = new window.kakao.maps.Marker({
        position: new window.kakao.maps.LatLng(store.lat, store.lng),
        map: map,
        title: store.name,
      });

      const infoWindow = new window.kakao.maps.InfoWindow({
        content: `<div style="padding:6px 12px; font-size:13px;">
          ${store.name}<br/>혜택: ${store.benefit}
        </div>`
      });

      window.kakao.maps.event.addListener(marker, 'mouseover', () => infoWindow.open(map, marker));
      window.kakao.maps.event.addListener(marker, 'mouseout', () => infoWindow.close());
    });
  }, [map]);

  useEffect(() => {
    if (!map) return;

    const handleClick = (mouseEvent: any) => {
      if (!isRoadviewMode) return;

      const clickedLatLng = mouseEvent.latLng;
      console.log('[지도 클릭됨]', clickedLatLng.getLat(), clickedLatLng.getLng());

      setPendingRoadviewLatLng(clickedLatLng);
      setShowRoadview(true);
      setIsRoadviewMode(false);
    };

    window.kakao.maps.event.addListener(map, 'click', handleClick);
  }, [map, isRoadviewMode]);

  // ✅ 로드뷰 오버레이 갱신 함수
  const updateRoadviewOverlays = (lat: number, lng: number, roadview: any) => {
    const stores = getStoresWithinRadius(lat, lng);

    // 기존 오버레이 제거
    currentOverlaysRef.current.forEach((overlay) => overlay.setMap(null));
    currentOverlaysRef.current = [];

    // 새 오버레이 추가
    stores.forEach((store) => {
      const overlay = new window.kakao.maps.CustomOverlay({
        position: new window.kakao.maps.LatLng(store.lat, store.lng),
        content: `
          <div style="
            padding:6px 12px;
            background:#ff567a;
            color:white;
            border-radius:10px;
            font-size:13px;
            white-space: nowrap;">
            ${store.name}<br/>혜택: ${store.benefit}
          </div>`,
        yAnchor: 0.5,
      });
      overlay.setMap(roadview);
      currentOverlaysRef.current.push(overlay);
    });
  };

  useEffect(() => {
    if (!showRoadview || !roadviewRef.current || !pendingRoadviewLatLng) return;

    const clickedLatLng = pendingRoadviewLatLng;
    const lat = clickedLatLng.getLat();
    const lng = clickedLatLng.getLng();
    const roadviewClient = new window.kakao.maps.RoadviewClient();
    const roadview = new window.kakao.maps.Roadview(roadviewRef.current);

    roadviewObjRef.current = roadview; // ✅ 전역 참조 저장

    roadviewClient.getNearestPanoId(clickedLatLng, 50, (panoId: number) => {
      if (panoId) {
        roadview.setPanoId(panoId, clickedLatLng);
      } else {
        alert('해당 위치에 로드뷰가 없습니다.');
        setShowRoadview(false);
      }
    });

    // ✅ 위치 변경 시마다 오버레이 갱신
    window.kakao.maps.event.addListener(roadview, 'position_changed', () => {
      const pos = roadview.getPosition();
      updateRoadviewOverlays(pos.getLat(), pos.getLng(), roadview);
    });

    setPendingRoadviewLatLng(null);
  }, [showRoadview]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
      {showRoadview && (
        <div
          ref={roadviewRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 5
          }}
        />
      )}

      <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 10 }}>
        <button
          onClick={() => {
            setIsRoadviewMode(true);
            alert('지도를 클릭하면 해당 위치의 로드뷰를 확인할 수 있어요!');
          }}
          style={{
            background: '#ff567a',
            color: '#fff',
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          로드뷰 보기
        </button>
        {showRoadview && (
          <button
            onClick={() => setShowRoadview(false)}
            style={{
              marginLeft: '10px',
              background: '#555',
              color: '#fff',
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            로드뷰 닫기
          </button>
        )}
      </div>
    </div>
  );
};

export default MapView;
