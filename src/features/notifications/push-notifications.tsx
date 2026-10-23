"use client";

import { getToken, onMessage } from "firebase/messaging";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { env } from "@/config/env";
import { backendAuthApi } from "@/features/auth/api";
import { useAuth } from "@/features/auth/hooks";
import { getFirebaseMessaging } from "@/lib/firebase/client";

function workerUrl() {
  const params = new URLSearchParams({
    apiKey: env.firebase.apiKey,
    authDomain: env.firebase.authDomain,
    projectId: env.firebase.projectId,
    storageBucket: env.firebase.storageBucket,
    messagingSenderId: env.firebase.messagingSenderId,
    appId: env.firebase.appId,
  });
  return `/firebase-messaging-sw.js?${params.toString()}`;
}

export function PushNotifications() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated || !env.firebase.vapidKey || !("Notification" in window)) return;
    let unsubscribe: (() => void) | undefined;
    let active = true;

    async function setup() {
      const permission = await Notification.requestPermission();
      if (permission !== "granted" || !active) return;
      const messaging = await getFirebaseMessaging();
      if (!messaging || !active) return;
      const registration = await navigator.serviceWorker.register(workerUrl());
      const token = await getToken(messaging, {
        vapidKey: env.firebase.vapidKey,
        serviceWorkerRegistration: registration,
      });
      if (token) await backendAuthApi.registerDevice(token, "WEB");

      unsubscribe = onMessage(messaging, (payload) => {
        const route = payload.data?.route || (payload.data?.booking_id ? `/bookings/${payload.data.booking_id}` : "/bookings");
        if (Notification.permission === "granted") {
          const notice = new Notification(payload.notification?.title || "Purple Squad update", {
            body: payload.notification?.body,
            icon: "/purple-squad-favicon.png",
          });
          notice.onclick = () => {
            window.focus();
            router.push(route);
            notice.close();
          };
        }
      });
    }

    void setup().catch(() => {
      // Push permission, browser support, or token registration failure must not block the app.
    });
    return () => {
      active = false;
      unsubscribe?.();
    };
  }, [isAuthenticated, router]);

  return null;
}
