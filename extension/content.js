window.addEventListener("message", (event) => {

    // safety check
    if (event.source !== window) return;

    // check message type
    if (event.data.type === "FROM_WEBSITE") {

        // send token to extension background
        chrome.runtime.sendMessage({
            type: "SAVE_TOKEN",
            token: event.data.token
        });

    } else if (event.data.type === "FROM_WEBSITE_LOGOUT") {
        
        // send logout event to extension background
        chrome.runtime.sendMessage({
            type: "REMOVE_TOKEN"
        });

    }

});