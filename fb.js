import {initializeApp} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import {getAuth,signInWithEmailAndPassword,createUserWithEmailAndPassword,signOut,onAuthStateChanged,EmailAuthProvider,reauthenticateWithCredential,updatePassword} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import {getFirestore,doc,getDoc,getDocs,setDoc,updateDoc,deleteDoc,addDoc,collection,query,where,onSnapshot,serverTimestamp} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

const cfg={apiKey:"AIzaSyBjRud7T49JmDfhkwUrNLeY1IcvXqW_W1Y",authDomain:"aihs-digital-library.firebaseapp.com",projectId:"aihs-digital-library",storageBucket:"aihs-digital-library.firebasestorage.app",messagingSenderId:"1032446713158",appId:"1:1032446713158:web:4f679abd8787cc759e9947"};
export const MAIL_URL="";   /* paste your Apps Script web app URL here (see mailer.gs) */
export const app=initializeApp(cfg), auth=getAuth(app), db=getFirestore(app);
export {query,where,signOut,onAuthStateChanged,doc,getDoc,getDocs,setDoc,updateDoc,deleteDoc,addDoc,collection,onSnapshot,serverTimestamp};

/* College ID is the user id. Firebase needs an email, so the ID is turned into one. */
export const idKey=id=>String(id).trim().toLowerCase().replace(/[^a-z0-9._-]/g,"-");
export const idEmail=id=>idKey(id)+"@aihs-library.in";
export const login=(id,pw)=>signInWithEmailAndPassword(auth,idEmail(id),pw);
export const signup=(id,pw)=>createUserWithEmailAndPassword(auth,idEmail(id),pw);

/* admin creates accounts without losing their own session */
let a2=null;
const second=()=>a2||(a2=getAuth(initializeApp(cfg,"second")));
export async function createAccount(id,pw){
  const c=await createUserWithEmailAndPassword(second(),idEmail(id),pw);
  await signOut(second());
  return c.user.uid;
}
export async function changePassword(cur,nw){
  const u=auth.currentUser;
  await reauthenticateWithCredential(u,EmailAuthProvider.credential(u.email,cur));
  await updatePassword(u,nw);
}
export function genPass(){
  const al="abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789",b=new Uint8Array(8);crypto.getRandomValues(b);
  return [].map.call(b,x=>al[x%al.length]).join("");
}
export async function mail(type,extra){
  if(!MAIL_URL||!auth.currentUser)return;
  try{
    const token=await auth.currentUser.getIdToken();
    await fetch(MAIL_URL,{method:"POST",mode:"no-cors",headers:{"Content-Type":"text/plain"},body:JSON.stringify(Object.assign({type,token},extra||{}))});
  }catch(e){}
}
export async function profile(u){
  const s=await getDoc(doc(db,"users",u.uid));return s.exists()?s.data():null;
}
export function go(p){
  if(!p)return "register.html";
  if(p.status==="approved"&&p.role==="admin")return "admin.html";
  return "dashboard.html";
}
export const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
