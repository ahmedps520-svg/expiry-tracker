/*
====================================
Expiry Tracker
notifications.js
====================================
*/

const EXPIRING_SOON_DAYS = 2;

/* -----------------------------
   Notification Permission
----------------------------- */

async function requestNotificationPermission() {

    if (!("Notification" in window)) {

        showToast("Notifications are not supported on this device.");

        return false;

    }

    if (Notification.permission === "granted") {

        showToast("Notifications are already enabled.");

        return true;

    }

    const permission = await Notification.requestPermission();

    if (permission === "granted") {

        showToast("Notifications enabled!");

        return true;

    }

    showToast("Notifications were not enabled.");

    return false;

}

/* -----------------------------
   Calculate Days Left
----------------------------- */

function getDaysRemaining(product) {

    const opened = new Date(product.openedDate);

    const expiry = new Date(opened);

    expiry.setDate(expiry.getDate() + Number(product.consumeWithinDays));

    const today = new Date();

    today.setHours(0,0,0,0);
    expiry.setHours(0,0,0,0);

    return Math.ceil(

        (expiry - today) /

        (1000 * 60 * 60 * 24)

    );

}

/* -----------------------------
   Product Status
----------------------------- */

function getProductStatus(product) {

    const days = getDaysRemaining(product);

    if (days < 0) {

        return "expired";

    }

    if (days <= EXPIRING_SOON_DAYS) {

        return "soon";

    }

    return "safe";

}

/* -----------------------------
   Statistics
----------------------------- */

function calculateStatistics() {

    let safe = 0;

    let soon = 0;

    let expired = 0;

    getProducts().forEach(product => {

        const status = getProductStatus(product);

        if (status === "safe") safe++;

        if (status === "soon") soon++;

        if (status === "expired") expired++;

    });

    return {

        safe,

        soon,

        expired

    };

}

/* -----------------------------
   Browser Notification
----------------------------- */

function sendExpiryNotification(product) {

    if (Notification.permission !== "granted") return;

    const days = getDaysRemaining(product);

    let body = "";

    if (days < 0) {

        body = `${product.name} has expired.`;

    }

    else if (days === 0) {

        body = `${product.name} expires today.`;

    }

    else {

        body = `${product.name} expires in ${days} day${days === 1 ? "" : "s"}.`;

    }

    new Notification("Expiry Tracker", {

        body,

        icon: "icons/icon-192.png"

    });

}

/* -----------------------------
   Check Every Product
----------------------------- */

function checkProductsForNotifications() {

    getProducts().forEach(product => {

        const status = getProductStatus(product);

        if (status === "soon" || status === "expired") {

            sendExpiryNotification(product);

        }

    });

}

console.log("Notifications Ready ✅");