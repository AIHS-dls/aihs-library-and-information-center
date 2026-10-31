import {initializeApp} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import {getAuth,GoogleAuthProvider,signInWithPopup,signOut,onAuthStateChanged} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import {getFirestore,doc,getDoc,setDoc,updateDoc,deleteDoc,addDoc,collection,onSnapshot,serverTimestamp} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

const cfg={apiKey:"AIzaSyBjRud7T49JmDfhkwUrNLeY1IcvXqW_W1Y",authDomain:"aihs-digital-library.firebaseapp.com",projectId:"aihs-digital-library",storageBucket:"aihs-digital-library.firebasestorage.app",messagingSenderId:"1032446713158",appId:"1:1032446713158:web:4f679abd8787cc759e9947"};
export const app=initializeApp(cfg), auth=getAuth(app), db=getFirestore(app);
export const BOOT=["librarian@aihs.ac.in","manjubd437@gmail.com"];
export {signOut,onAuthStateChanged,doc,getDoc,setDoc,updateDoc,deleteDoc,addDoc,collection,onSnapshot,serverTimestamp};

export async function google(){
  const p=new GoogleAuthProvider(); p.setCustomParameters({prompt:"select_account"});
  return (await signInWithPopup(auth,p)).user;
}
export async function profile(u){
  const s=await getDoc(doc(db,"users",u.uid)); return s.exists()?s.data():null;
}
/* one login for everyone: where should this person land? */
export function go(p){
  if(!p) return "register.html";
  if(p.status==="approved" && p.role==="admin") return "admin.html";
  return "dashboard.html";
}
export const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
