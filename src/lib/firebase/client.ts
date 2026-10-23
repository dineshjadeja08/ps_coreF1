"use client";

import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getMessaging, isSupported } from "firebase/messaging";

import { env } from "@/config/env";

export function getFirebaseApp() {
  const config = env.firebase;
  if (!config.apiKey || !config.authDomain || !config.projectId || !config.appId) {
    throw new Error("Firebase web configuration is incomplete.");
  }
  return getApps().length ? getApp() : initializeApp(config);
}

export function getFirebaseAuth() {
  return getAuth(getFirebaseApp());
}

export async function getFirebaseMessaging() {
  if (!(await isSupported())) return null;
  return getMessaging(getFirebaseApp());
}
