document.addEventListener("DOMContentLoaded", () => {
    const timeline = document.getElementById("main-timeline");
    const searchInput = document.querySelector(".search-input");
    let allTweets = [];
    let initialTweets = [];

    // 1. 全データを抽出（profilesDataが存在するかチェック）
    if (typeof profilesData === 'undefined') {
        console.error("profilesDataが定義されていません。data.jsが正しく読み込まれているか確認してください。");
        timeline.innerHTML = "データが見つかりません。";
        return;
    }

    for (let userId in profilesData) {
        const user = profilesData[userId];
        if (!user.tweets) continue;
        user.tweets.forEach(tweet => {
            allTweets.push({
                ...tweet,
                userName: user.name,
                userHandle: user.handle,
                userAvatar: user.avatar,
                userId: userId
            });
        });
    }

    console.log("読み込んだ総ツイート数:", allTweets.length);

    // 2. ユーザーごとにグループ化
    const userGroups = {};
    allTweets.forEach(tweet => {
        if (!userGroups[tweet.userId]) userGroups[tweet.userId] = [];
        userGroups[tweet.userId].push(tweet);
    });

    const guaranteedTweets = []; 
    const poolTweets = [];

    Object.keys(userGroups).forEach(userId => {
        const userTweets = userGroups[userId];
        
        // ソート（日付形式が 2024/01/01 12:00 のような形式を想定）
        userTweets.sort((a, b) => {
            const dateA = new Date(a.timestamp.replace(/\//g, '-'));
            const dateB = new Date(b.timestamp.replace(/\//g, '-'));
            return dateA - dateB; // 昇順（最後が最新）
        });
        
        const latest = userTweets.pop();
        if (latest) guaranteedTweets.push(latest);

        userTweets.forEach(tweet => {
            const idNum = parseInt(userId);
            if (idNum >= 1 && idNum <= 9) {
                poolTweets.push(tweet);
                poolTweets.push(tweet); 
            } else {
                poolTweets.push(tweet);
            }
        });
    });

    // 3. シャッフル（シード固定）
    let seed = 1234567; 
    function seededRandom() {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
    }

    for (let i = poolTweets.length - 1; i > 0; i--) {
        const j = Math.floor(seededRandom() * (i + 1));
        [poolTweets[i], poolTweets[j]] = [poolTweets[j], poolTweets[i]];
    }

    // 4. 合体と最終シャッフル
    initialTweets = [...guaranteedTweets, ...poolTweets];
    
    // 全体を混ぜる
    for (let i = initialTweets.length - 1; i > 0; i--) {
        const j = Math.floor(seededRandom() * (i + 1));
        [initialTweets[i], initialTweets[j]] = [initialTweets[j], initialTweets[i]];
    }

    // デバッグ：最終的に何件表示するか
    console.log("表示対象件数:", initialTweets.length);

    // 5. ツイートを描画する関数（安全なHTML生成に修正）
    function renderTimeline(tweetsToRender) {
        timeline.innerHTML = "";

        if (tweetsToRender.length === 0) {
            timeline.innerHTML = `<div style="padding: 20px; color: #71767b; text-align: center;">表示できるポストがありません。</div>`;
            return;
        }

        tweetsToRender.forEach(tweet => {
            const processedText = tweet.text.replace(/(@[a-zA-Z0-9_]+)/g, '<span class="mention">$1</span>');
            
            let imageHtml = "";
            if (tweet.images && tweet.images.length > 0) {
                imageHtml = `<div class="tweet-images" data-count="${tweet.images.length}">` +
                    tweet.images.map(img => `<img src="${img}" class="clickable-img" onclick="event.stopPropagation(); openModal('${img}')">`).join('') +
                    `</div>`;
            }

            const replyLabel = tweet.replyTo 
                ? `<div class="replying-to" style="color: #71767b; font-size: 14px; margin-bottom: 4px;">返信先: <span class="mention">${tweet.replyTo}</span></div>` 
                : "";

            const tweetDiv = document.createElement("div");
            tweetDiv.className = "tweet";
            tweetDiv.onclick = () => location.href = `tweet-detail.html?id=${tweet.id}`;
            tweetDiv.innerHTML = `
                <div class="avatar" onclick="event.stopPropagation(); location.href='profile.html?id=${tweet.userId}'">
                    <img src="${tweet.userAvatar}" class="avatar-img">
                </div>
                <div class="tweet-content">
                    <div class="tweet-header">
                        <span class="username" onclick="event.stopPropagation(); location.href='profile.html?id=${tweet.userId}'">${tweet.userName}</span>
                        <span class="handle">${tweet.userHandle}</span>
                        <span class="timestamp">· ${tweet.timestamp}</span>
                    </div>
                    ${replyLabel}
                    <div class="tweet-text">${processedText}</div>
                    ${imageHtml}
                    <div class="tweet-actions">
                        <div class="action"><span>💬 ${tweet.actions.replies}</span></div>
                        <div class="action"><span>🔁 ${tweet.actions.retweets}</span></div>
                        <div class="action"><span>❤️ ${tweet.actions.likes}</span></div>
                    </div>
                </div>
            `;
            timeline.appendChild(tweetDiv);
        });
    }

    renderTimeline(initialTweets);

    // 検索処理
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            const query = e.target.value.toLowerCase().trim();
            if (query === "") {
                renderTimeline(initialTweets);
            } else {
                const filtered = allTweets.filter(t => 
                    t.userName.toLowerCase().includes(query) || 
                    t.userHandle.toLowerCase().includes(query) || 
                    t.text.toLowerCase().includes(query)
                );
                renderTimeline(filtered);
            }
        });
    }
});

function openModal(src) {
    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("fullImage");
    if (modal && modalImg) {
        modal.style.display = "flex";
        modalImg.src = src;
    }
}