const functions = require("firebase-functions");

const admin = require("firebase-admin");

admin.initializeApp();

const db = admin.firestore();
const fcm = admin.messaging();

exports.addedLecture = functions.firestore
  .document("classes/{classId}/lectures/lecturesToday")
  .onUpdate(async (change, context) => {
    const classId = context.params.classId;

    console.log(classId);

    const newValue = change.after.data();

    // Lectures array
    const lectures = newValue.lectures;

    let newLecture = lectures[lectures.length - 1];

    console.log(newLecture);

    // fcmTokens will be stored in this array
    // if messages are not to be sent then array would be empty
    let fcmTokens;

    // Reading document for fcmtokens
    const docRef = db
      .collection(`classes/${classId}/fcmTokens`)
      .doc("fcmTokens");
    const doc = await docRef.get();
    if (!doc.exists) {
      console.log("No such document!");
    } else {
      console.log("Document data:", doc.data());
      fcmTokens = [...doc.data().fcmTokens];
    }

    // payload contains the content of the notiication
    const payload = (admin.messaging.MessagingPayload = {
      notification: {
        title: "LINK AA GYA",
        body: `Join ${newLecture.subject} class`,
        // icon: "your-icon-url",
        // click_action: "FLUTTER_NOTIFICATION_CLICK",
      },
    });

    console.log(payload);

    // current time to compare for not letting notifications
    // go after 7
    let timeNow = new Date();

    console.log(timeNow.getUTCHours());

    if (timeNow.getUTCHours() + 5 >= 20)
      return fcm.sendToDevice([], payload);
    else 
      return fcm.sendToDevice(fcmTokens, payload);
  });

exports.addedUpdate = functions.firestore
  .document("classes/{classId}/updates/announcements")
  .onUpdate(async (change, context) => {
    const classId = context.params.classId;

    console.log(classId);

    const newValue = change.after.data();

    const updates = newValue.announcements;

    let newUpdate = updates[updates.length - 1];

    console.log(newUpdate);

    let fcmTokens;

    const docRef = db
      .collection(`classes/${classId}/fcmTokens`)
      .doc("fcmTokens");
    const doc = await docRef.get();
    if (!doc.exists) {
      console.log("No such document!");
    } else {
      console.log("Document data:", doc.data());
      fcmTokens = [...doc.data().fcmTokens];
    }

    const payload = (admin.messaging.MessagingPayload = {
      notification: {
        title: `New ${newUpdate.type}`,
        body: `${newUpdate.text}`,
        // icon: "your-icon-url",
        // click_action: "FLUTTER_NOTIFICATION_CLICK",
      },
    });

    console.log(payload);


    // send poll notifications only when countYes and CountNo are 0

    let timeNow = new Date();

    if (newUpdate.type == "poll")
    {
      if (newUpdate.noCount == 0 && yesCount == 0)
        return fcm.sendToDevice(fcmTokens, payload);
      else 
        return fcm.sendToDevice([], payload);
    } else {
      if (timeNow.getTime() > newUpdate.dateAndTime.getTime() + 120000)
        return fcm.sendToDevice([], payload);
      else 
        return fcm.sendToDevice(fcmTokens, payload);
    } 
  });
