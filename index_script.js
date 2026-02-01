document.addEventListener("DOMContentLoaded", () => {
    const timeline = document.getElementById("main-timeline");
    const searchInput = document.querySelector(".search-input");
    let allTweets = [];
    let initialTweets = [];

    if (typeof profilesData === 'undefined') return;

    // 1. 全データ抽出
    for (let userId in profilesData) {
        const user = profilesData[userId];
        user.tweets.forEach(tweet => {
            allTweets.push({ ...tweet, userName: user.name, userHandle: user.handle, userAvatar: user.avatar, userId: userId });
        });
    }

    // 2. グループ化と選別
    const userGroups = {};
    allTweets.forEach(tweet => {
        if (!userGroups[tweet.userId]) userGroups[tweet.userId] = [];
        userGroups[tweet.userId].push(tweet);
    });

    const guaranteedTweets = []; 
    const poolTweets = [];

    Object.keys(userGroups).forEach(userId => {
        const userTweets = [...userGroups[userId]];
        userTweets.sort((a, b) => new Date(a.timestamp.replace(/\//g, '-')) - new Date(b.timestamp.replace(/\//g, '-')));
        
        const latest = userTweets.pop();
        if (latest) guaranteedTweets.push(latest);

        userTweets.forEach(tweet => {
            if (parseInt(userId) <= 9) { poolTweets.push(tweet); poolTweets.push(tweet); }
            else { poolTweets.push(tweet); }
        });
    });

    // 3. シャッフル（シード固定）
    let seed = 8888888; // シード値を大きく変更
    function seededRandom() {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
    }

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(seededRandom() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // 4. 【最強の並び替え】合体後にトップをチェック
    let combined = shuffle([...guaranteedTweets, ...poolTweets]);

    // ★重要：もし一番上が「大橋（userId: "2"）」だったら、2番目と入れ替える
    if (combined[0] && combined[0].userId === "2") {
        const first = combined.shift();
        combined.push(first); // 大橋を一番最後に回す
    }
    
    initialTweets = combined;

    // 5. 描画関数
    function renderTimeline(tweetsToRender) {
        if (!timeline) return;
        timeline.innerHTML = "";
        tweetsToRender.forEach(tweet => {
            const processedText = tweet.text.replace(/(@[a-zA-Z0-9_]+)/g, '<span class="mention">$1</span>');
            const imageHtml = (tweet.images && tweet.images.length > 0) 
                ? `<div class="tweet-images" data-count="${tweet.images.length}">${tweet.images.map(img => `<img src="${img}" class="clickable-img" onclick="event.stopPropagation(); openModal('${img}')">`).join('')}</div>` : "";
            const replyLabel = tweet.replyTo ? `<div class="replying-to">返信先: <span class="mention">${tweet.replyTo}</span></div>` : "";

            const tweetDiv = document.createElement("div");
            tweetDiv.className = "tweet";
            tweetDiv.style.position = "relative"; 
            tweetDiv.onclick = () => location.href = `tweet-detail.html?id=${tweet.id}`;
            tweetDiv.innerHTML = `
                <div class="avatar" onclick="event.stopPropagation(); location.href='profile.html?id=${tweet.userId}'"><img src="${tweet.userAvatar}" class="avatar-img"></div>
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
                <div class="evidence-number" style="position: absolute; bottom: 8px; right: 12px; font-size: 11px; color: #2f3336; font-family: monospace; font-weight: bold; pointer-events: none;">#${tweet.id}</div>
            `;
            timeline.appendChild(tweetDiv);
        });
    }

    renderTimeline(initialTweets);

    // 検索
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            const query = e.target.value.toLowerCase().trim();
            renderTimeline(query === "" ? initialTweets : allTweets.filter(t => t.userName.toLowerCase().includes(query) || t.userHandle.toLowerCase().includes(query) || t.text.toLowerCase().includes(query)));
        });
    }
});

function openModal(src) {
    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("fullImage");
    if (modal && modalImg) { modal.style.display = "flex"; modalImg.src = src; }
}