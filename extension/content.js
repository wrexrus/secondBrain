window.addEventListener("message", (event) => {

    // safety check
    if (event.source !== window) return;

    // imp: Security check to block fake messages from malicious iframes/ads
    if (event.origin !== "http://localhost:5173") return;

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