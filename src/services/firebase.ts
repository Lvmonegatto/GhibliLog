import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApp, getApps, initializeApp } from "firebase/app";
import { initializeAuth } from "firebase/auth";

// @ts-expect-error O Firebase não declara este helper RN nos tipos públicos compartilhados.
import { getReactNativePersistence } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAKuBc9dIdp-y1EL6bj99pD1y6EuWgSmOY",
  authDomain: "ghiblilog-856d7.firebaseapp.com",
  databaseURL: "https://ghiblilog-856d7-default-rtdb.firebaseio.com",
  projectId: "ghiblilog-856d7",
  storageBucket: "ghiblilog-856d7.firebasestorage.app",
  messagingSenderId: "438467596173",
  appId: "1:438467596173:web:b18d74cfc638a8467f77c4",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const database = getDatabase(app, firebaseConfig.databaseURL);
