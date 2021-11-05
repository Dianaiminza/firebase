
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "1007456522598",
  appId: "",
  measurementId: "G-RFRYVTKEQY"
};

const initializeAuthentication = () => {
    return initializeApp(firebaseConfig)
}

export default initializeAuthentication;

