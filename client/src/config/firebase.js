
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAxc46_vuzRh2tiyY4kRnTVp981eHP-SSE",
  authDomain: "portfolio-88cee.firebaseapp.com",
  projectId: "portfolio-88cee",
  storageBucket: "portfolio-88cee.appspot.com",
  messagingSenderId: "1007456522598",
  appId: "1:1007456522598:web:938fa7a15576f7c48638a7",
  measurementId: "G-RFRYVTKEQY"
};

const initializeAuthentication = () => {
    return initializeApp(firebaseConfig)
}

export default initializeAuthentication;

