"use client";

import Script from "next/script";
import { useEffect, useId, useMemo, useRef, useState } from "react";

declare global {
  interface Window {
    naver?: {
      maps: {
        LatLng: new (lat: number, lng: number) => unknown;
        Map: new (element: HTMLElement, options: Record<string, unknown>) => unknown;
        Marker: new (options: Record<string, unknown>) => unknown;
        InfoWindow: new (options: Record<string, unknown>) => { open: (map: unknown, marker: unknown) => void };
        Event: {
          addListener: (target: unknown, eventName: string, listener: () => void) => void;
        };
      };
    };
  }
}

const defaultClientId = "we67w1jozc";

interface NaverMapProps {
  lat: number;
  lng: number;
  title: string;
  address: string;
  className?: string;
}

export function NaverMap({ lat, lng, title, address, className }: NaverMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapId = useId();
  const [isReady, setIsReady] = useState(false);
  const clientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID || defaultClientId;
  const scriptUrl = useMemo(() => `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}`, [clientId]);

  useEffect(() => {
    if (!isReady || !mapRef.current || !window.naver?.maps) return;

    const center = new window.naver.maps.LatLng(lat, lng);
    const map = new window.naver.maps.Map(mapRef.current, {
      center,
      zoom: 16,
      minZoom: 10,
      scaleControl: false,
      logoControl: true,
      mapDataControl: false,
      zoomControl: true,
      zoomControlOptions: { position: 1 },
    });

    const marker = new window.naver.maps.Marker({
      position: center,
      map,
      title,
    });

    const infoWindow = new window.naver.maps.InfoWindow({
      content: `
        <div style="padding:12px 14px;line-height:1.5;color:#1d261f;min-width:190px;">
          <strong style="display:block;margin-bottom:4px;font-size:14px;">${title}</strong>
          <span style="font-size:12px;color:#596258;">${address}</span>
        </div>
      `,
    });

    infoWindow.open(map, marker);
    window.naver.maps.Event.addListener(marker, "click", () => infoWindow.open(map, marker));
  }, [address, isReady, lat, lng, title]);

  return (
    <div className={`relative overflow-hidden rounded-lg ${className ?? ""}`}>
      <Script id="naver-map-sdk" src={scriptUrl} strategy="afterInteractive" onReady={() => setIsReady(true)} onLoad={() => setIsReady(true)} />
      <div ref={mapRef} id={`naver-map-${mapId}`} className="h-full min-h-80 w-full rounded-lg" aria-label={`${title} 네이버 지도`} />
      {!isReady ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-lg bg-[#dcebe7] text-sm font-semibold text-[#24573a]">
          지도를 불러오는 중입니다
        </div>
      ) : null}
    </div>
  );
}
