chrome.runtime.onMessage.addListener((message) => {

    if (message.type === "SAVE_TOKEN") {

        chrome.storage.local.set({
            token: message.token
        });

        console.log("Token Saved");
    } else if (message.type === "REMOVE_TOKEN") {

        chrome.storage.local.remove('token');
        console.log("Token Removed");
    }

});