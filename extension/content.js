const ALLOWED_ORIGINS = [
  "https://second-brain-phi-liart.vercel.app"
];

window.addEventListener("message", (event) => {
    // safety check
    if (event.source !== window) return;

    // imp: Security check to block fake messages from malicious iframes/ads
    if (!ALLOWED_ORIGINS.includes(event.origin)) return;

    // check message type
    if (event.data.type === "FROM_WEBSITE") {

        // send token and user to extension background
        chrome.runtime.sendMessage({
            type: "SAVE_TOKEN",
            token: event.data.token,
            user: event.data.user
        });

    } else if (event.data.type === "FROM_WEBSITE_LOGOUT") {
        
        // send logout event to extension background
        chrome.runtime.sendMessage({
            type: "REMOVE_TOKEN"
        });

    }

});

// Listen for messages from the extension (like popup.js) and forward them to the React window
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "REFRESH_CATEGORIES") {
        window.postMessage({ type: "REFRESH_CATEGORIES" }, window.location.origin);
    }
});