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

    const lectures = newValue.lectures;

    let newLecture = lectures[lectures.length - 1];

    console.log(newLecture);

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
        title: "LINK AA GYA",
        body: `Link for ${newLecture.subject} has been added.`,
        // icon: "your-icon-url",
        // click_action: "FLUTTER_NOTIFICATION_CLICK",
      },
    });

    console.log(payload);

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

    return fcm.sendToDevice(fcmTokens, payload);
  });
