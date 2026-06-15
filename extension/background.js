chrome.runtime.onMessage.addListener((message) => {

    if (message.type === "SAVE_TOKEN") {

        chrome.storage.local.set({
            token: message.token,
            user: message.user
        });

        console.log("Token Saved");
    } else if (message.type === "REMOVE_TOKEN") {

        chrome.storage.local.remove(['token', 'user']);
        console.log("Token and User Removed");
    }

});