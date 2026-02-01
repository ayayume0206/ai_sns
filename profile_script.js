document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const userId = params.get("id");
    const user = profilesData[userId];

    if (!user) {
        console.error("ユーザーが見つかりません。ID:", userId);
        return;
    }

    // --- プロフィール情報の書き換え ---
    document.getElementById("header-name").innerText = user.name;
    document.getElementById("header-tweet-count").innerText = `${user.tweetCount}件のポスト`;
    document.getElementById("profile-avatar").src = user.avatar;
    document.getElementById("profile-display-name").innerText = user.name;
    document.getElementById("profile-handle").innerText = user.handle;
    document.getElementById("profile-bio").innerHTML = user.bio;
    document.getElementById("profile-joined").innerText = `📅 ${user.joined}から利用しています`;
    document.getElementById("profile-following").innerText = user.following;
    document.getElementById("profile-followers").innerText = user.followers;

    const headerImgEl = document.getElementById("profile-header-img");
    if (user.headerImg) {
        headerImgEl.style.backgroundImage = `url('${user.headerImg}')`;
    } else {
        headerImgEl.style.backgroundImage = 'none';
    }

    // --- タイムラインの生成 ---
    const timeline = document.getElementById("profile-timeline");
    timeline.innerHTML = ""; 

    user.tweets.forEach(tweet => {
        // メンションを青くするための処理
        let processedText = tweet.text.replace(/(@[a-zA-Z0-9_]+)/g, '<span class="mention">$1</span>');
        
        // 【重要】返信先 (@handle) の表示を作成
        let replyHtml = "";
        if (tweet.replyTo) {
            replyHtml = `<div class="replying-to">返信先: <span class="mention">${tweet.replyTo}</span></div>`;
        }

        // 画像の生成
        let imageHtml = "";
        if (tweet.images && tweet.images.length > 0) {
            imageHtml = `<div class="tweet-images" data-count="${tweet.images.length}">`;
            tweet.images.forEach(img => {
                imageHtml += `<img src="${img}" class="clickable-img" onclick="event.stopPropagation(); openModal('${img}')">`;
            });
            imageHtml += `</div>`;
        }

        // ツイートHTML
        const tweetHtml = `
            <div class="tweet" onclick="location.href='tweet-detail.html?id=${tweet.id}'">
                <div class="avatar">
                    <img src="${user.avatar}" class="avatar-img">
                </div>
                <div class="tweet-content">
                    <div class="tweet-header">
                        <span class="username">${user.name}</span>
                        <span class="handle">${user.handle}</span>
                        <span class="timestamp">· ${tweet.timestamp}</span>
                    </div>
                    ${replyHtml} <div class="tweet-text">${processedText}</div>
                    ${imageHtml}
                    <div class="tweet-actions">
                        <div class="action"><span>💬 ${tweet.actions.replies}</span></div>
                        <div class="action"><span>🔁 ${tweet.actions.retweets}</span></div>
                        <div class="action"><span>❤️ ${tweet.actions.likes}</span></div>
                    </div>
                </div>
            </div>
        `;
        timeline.innerHTML += tweetHtml;
    });
});

function openModal(src) {
    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("fullImage");
    if (modal && modalImg) {
        modal.style.display = "flex";
        modalImg.src = src;
    }
}