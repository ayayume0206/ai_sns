window.onload = function() {
    const params = new URLSearchParams(window.location.search);
    const tweetId = parseInt(params.get("id"));

    console.log("取得したID:", tweetId);

    if (isNaN(tweetId)) {
        document.getElementById("main-tweet-text").innerText = "IDが指定されていません。";
        return;
    }

    if (typeof profilesData === 'undefined') {
        alert("data.js が読み込めていないようです。ファイル名や場所を確認してください。");
        return;
    }

    let targetTweet = null;
    let tweetUser = null;

    // 全探索
    Object.keys(profilesData).forEach(key => {
        const user = profilesData[key];
        const found = user.tweets.find(t => t.id === tweetId);
        if (found) {
            targetTweet = found;
            tweetUser = user;
        }
    });

    if (targetTweet && tweetUser) {
        // --- メインツイートの表示処理 ---
        document.getElementById("main-tweet-avatar").innerHTML = `<img src="${tweetUser.avatar}" class="avatar-img">`;
        document.getElementById("main-tweet-username").innerText = tweetUser.name;
        document.getElementById("main-tweet-handle").innerText = tweetUser.handle;
        
        let processedText = targetTweet.text.replace(/(@[a-zA-Z0-9_]+)/g, '<span class="mention">$1</span>');
        document.getElementById("main-tweet-text").innerHTML = processedText;

        const imgContainer = document.getElementById("main-tweet-images");
        imgContainer.innerHTML = "";
        if (targetTweet.images && targetTweet.images.length > 0) {
            imgContainer.setAttribute("data-count", targetTweet.images.length);
            targetTweet.images.forEach(img => {
                imgContainer.innerHTML += `<img src="${img}" class="clickable-img" onclick="openModal('${img}')">`;
            });
        }

        document.getElementById("main-tweet-info").innerHTML = `<span>${targetTweet.timestamp}</span>`;
        document.getElementById("action-replies").innerText = `💬 ${targetTweet.actions.replies}`;
        document.getElementById("action-retweets").innerText = `🔁 ${targetTweet.actions.retweets}`;
        document.getElementById("action-likes").innerText = `❤️ ${targetTweet.actions.likes}`;
        
        // --- ここからリプライ表示処理（window.onload の中に入れる） ---
        const repliesContainer = document.getElementById("replies-container");
        if (repliesContainer) {
            repliesContainer.innerHTML = ""; // 一旦空にする

            if (targetTweet.replyData && targetTweet.replyData.length > 0) {
                targetTweet.replyData.forEach(reply => {
                    const rUser = profilesData[reply.userId];
                    if (!rUser) return;

                    const replyHtml = `
                        <div class="tweet reply-tweet">
                            <div class="avatar" onclick="location.href='profile.html?id=${rUser.id}'">
                                <img src="${rUser.avatar}" class="avatar-img">
                            </div>
                            <div class="tweet-content">
                                <div class="tweet-header">
                                    <span class="username" onclick="location.href='profile.html?id=${rUser.id}'">${rUser.name}</span>
                                    <span class="handle">${rUser.handle}</span>
                                    <span class="timestamp">· ${reply.timestamp}</span>
                                </div>
                                <div class="replying-to">返信先: <span class="mention">${tweetUser.handle}</span></div>
                                <div class="tweet-text">${reply.text}</div>
                                <div class="tweet-actions">
                                    <div class="action"><span>💬 0</span></div>
                                    <div class="action"><span>🔁 0</span></div>
                                    <div class="action"><span>❤️ 0</span></div>
                                </div>
                            </div>
                        </div>
                    `;
                    repliesContainer.innerHTML += replyHtml;
                });
            }
        }
        
        console.log("表示成功！");
    } else {
        document.getElementById("main-tweet-text").innerText = "指定されたツイート(ID:" + tweetId + ")が見つかりませんでした。";
    }

    // --- tweet-detail.js 内 ---
    if (targetTweet && tweetUser) {
        // ...既存の表示処理...

        // 右下に証拠番号を表示
        const evidenceEl = document.getElementById("evidence-id-display");
        if (evidenceEl) {
            evidenceEl.innerText = `#${targetTweet.id}`; // 例: #118 と表示
        }
        
        console.log("表示成功！");
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