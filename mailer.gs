/* AIHS Library - confirmation emails (free, runs on Google Apps Script)
   Sends from the Google account that deploys it. See the steps given in chat. */

const API_KEY   = "AIzaSyBjRud7T49JmDfhkwUrNLeY1IcvXqW_W1Y";   // Firebase web API key
const PROJECT   = "aihs-digital-library";
const ADMIN_IDS = ["librarian", "manju"];                      // College IDs of your admins (lowercase)
const SITE      = "https://YOUR-USERNAME.github.io/aihs-library-and-information-center/";
const DAILY_LIMIT = 80;                                        // safety limit of emails per day

function doPost(e) {
  try {
    const b = JSON.parse(e.postData.contents);
    const me = lookup(b.token);
    if (!me) return out("auth");
    const myId = me.email.split("@")[0];
    const props = PropertiesService.getScriptProperties();
    const day = Utilities.formatDate(new Date(), "Asia/Kolkata", "yyyy-MM-dd");
    const used = Number(props.getProperty("n_" + day) || 0);
    if (used >= DAILY_LIMIT) return out("limit");

    let uid;
    if (b.type === "registered") uid = me.localId;
    else if (ADMIN_IDS.indexOf(myId) >= 0 && (b.type === "approved" || b.type === "created")) uid = b.uid;
    else return out("forbidden");

    const key = b.type + "_" + uid;
    if (props.getProperty(key)) return out("already");
    const u = getUser(uid, b.token);
    if (!u || !u.email) return out("noemail");

    const name = u.name || "Student";
    let subject, body;
    if (b.type === "registered") {
      subject = "AIHS Library: registration received";
      body = "Dear " + name + ",\n\nYour registration (College ID: " + u.idNo + ") has been received by AIHS Library and Information Center.\nThe librarian will approve it shortly. You will get another email once it is approved.\n\nThank you.";
    } else if (b.type === "approved") {
      subject = "AIHS Library: your account is approved";
      body = "Dear " + name + ",\n\nYour library account is approved. You can now login with your College ID (" + u.idNo + ") and your password:\n" + SITE + "login.html\n\nThank you.";
    } else {
      subject = "AIHS Library: your account is ready";
      body = "Dear " + name + ",\n\nYour library account has been created.\nLogin: " + SITE + "login.html\nUser ID (College ID): " + u.idNo + "\nPassword: " + (b.password || "") + "\n\nPlease change your password after your first login (My Library > Change password).\n\nThank you.";
    }
    MailApp.sendEmail({ to: u.email, subject: subject, body: body, name: "AIHS Library" });
    props.setProperty(key, "1");
    props.setProperty("n_" + day, String(used + 1));
    return out("sent");
  } catch (err) {
    return out("error");
  }
}

function lookup(token) {
  const r = UrlFetchApp.fetch("https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=" + API_KEY, {
    method: "post", contentType: "application/json", payload: JSON.stringify({ idToken: token }), muteHttpExceptions: true
  });
  const j = JSON.parse(r.getContentText());
  return j.users && j.users[0] ? j.users[0] : null;
}

function getUser(uid, token) {
  const r = UrlFetchApp.fetch("https://firestore.googleapis.com/v1/projects/" + PROJECT + "/databases/(default)/documents/users/" + uid, {
    headers: { Authorization: "Bearer " + token }, muteHttpExceptions: true
  });
  const j = JSON.parse(r.getContentText());
  if (!j.fields) return null;
  const f = j.fields, v = function (k) { return f[k] && f[k].stringValue ? f[k].stringValue : ""; };
  return { name: v("name"), email: v("email"), idNo: v("idNo") };
}

function out(s) { return ContentService.createTextOutput(s); }
