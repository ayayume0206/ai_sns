window.onload = function() {
    const params = new URLSearchParams(window.location.search);
    const tweetId = parseInt(params.get("id"));

    if (isNaN(tweetId)) {
        document.getElementById("main-tweet-text").innerText = "IDが指定されていません。";
        return;
    }

    let targetTweet = null;
    let tweetUser = null;

    // profilesDataから対象ツイートを検索
    Object.keys(profilesData).forEach(key => {
        const user = profilesData[key];
        const found = user.tweets.find(t => t.id === tweetId);
        if (found) {
            targetTweet = found;
            tweetUser = user;
        }
    });

    if (targetTweet && tweetUser) {
        // 基本情報
        document.getElementById("main-tweet-avatar").innerHTML = `<img src="${tweetUser.avatar}" class="avatar-img" style="width:48px; height:48px; border-radius:50%; object-fit:cover;">`;
        document.getElementById("main-tweet-username").innerText = tweetUser.name;
        document.getElementById("main-tweet-handle").innerText = tweetUser.handle;
        
        // 証拠番号（ID）の表示
        document.getElementById("evidence-id-display").innerText = `#${targetTweet.id}`;

        // 本文と返信先の青文字処理
        let processedText = targetTweet.text.replace(/(@[a-zA-Z0-9_]+)/g, '<span class="mention">$1</span>');
        let replyHeader = "";
        if (targetTweet.replyTo) {
            replyHeader = `<div class="replying-to">返信先: <span class="mention">${targetTweet.replyTo}</span></div>`;
        }
        document.getElementById("main-tweet-text").innerHTML = replyHeader + processedText;

        // 画像の表示
        const imgContainer = document.getElementById("main-tweet-images");
        imgContainer.innerHTML = "";
        if (targetTweet.images && targetTweet.images.length > 0) {
            imgContainer.className = "tweet-images";
            imgContainer.setAttribute("data-count", targetTweet.images.length);
            targetTweet.images.forEach(img => {
                imgContainer.innerHTML += `<img src="${img}" class="clickable-img" style="width:100%; cursor:pointer;" onclick="openModal('${img}')">`;
            });
        }

        document.getElementById("main-tweet-info").innerHTML = `<span>${targetTweet.timestamp}</span>`;
        document.getElementById("action-replies").innerText = `💬 ${targetTweet.actions.replies}`;
        document.getElementById("action-retweets").innerText = `🔁 ${targetTweet.actions.retweets}`;
        document.getElementById("action-likes").innerText = `❤️ ${targetTweet.actions.likes}`;
        
        // リプライ表示処理
        const repliesContainer = document.getElementById("replies-container");
        if (repliesContainer && targetTweet.replyData) {
            repliesContainer.innerHTML = "";
            targetTweet.replyData.forEach(reply => {
                const rUser = profilesData[reply.userId];
                if (!rUser) return;
                const replyHtml = `
                    <div class="tweet" style="padding: 12px 16px; border-bottom: 1px solid #2f3336; display: flex; gap: 12px;">
                        <div class="avatar"><img src="${rUser.avatar}" class="avatar-img" style="width:40px; height:40px; border-radius:50%; object-fit:cover;"></div>
                        <div class="tweet-content">
                            <div class="tweet-header">
                                <span class="username" style="font-weight:bold; color:#e7e9ea;">${rUser.name}</span>
                                <span class="handle" style="color:#71767b;">${rUser.handle}</span>
                                <span class="timestamp" style="color:#71767b;">· ${reply.timestamp}</span>
                            </div>
                            <div class="replying-to">返信先: <span class="mention">${tweetUser.handle}</span></div>
                            <div class="tweet-text" style="color:#e7e9ea;">${reply.text.replace(/(@[a-zA-Z0-9_]+)/g, '<span class="mention">$1</span>')}</div>
                        </div>
                    </div>
                `;
                repliesContainer.innerHTML += replyHtml;
            });
        }
    } else {
        document.getElementById("main-tweet-text").innerText = "ツイートが見つかりませんでした。";
    }
};

function openModal(src) {
    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("fullImage");
    if (modal && modalImg) {
        modal.style.display = "flex";
        modalImg.src = src;
    }
}