
import * as firebase from 'firebase';
import 'firebase/auth';
import 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyCmuDZ2GoT-TdkV28bio2pQN_gcerzm9hM",
  authDomain: "ghiblilog-219a1.firebaseapp.com",
  databaseURL: "https://ghiblilog-219a1-default-rtdb.firebaseio.com",
  projectId: "ghiblilog-219a1",
  storageBucket: "ghiblilog-219a1.firebasestorage.app",
  messagingSenderId: "320256440311",
  appId: "1:320256440311:web:48b19f3d19daa913fd20f2"
};

// Inicializa o Firebase apenas uma vez
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export default firebase;
