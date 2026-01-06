// formから
export async function submit(text) {
    const res = await fetch("/.netlify/functions/posts", {
        //  POST:フォーム送信の命令
        method: "POST",
        // jsonであることを明示
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
    });

    // HTTPステータスコードが200~299ならtrue
    if (!res.ok) {
        throw new Error("投稿に失敗しました");
    }

    return res.json();
}

// dbから投稿履歴取得
export async function fetchPosts(){
    const res = await fetch("/.netlify/functions/posts");
    if(!res.ok) throw new Error("failed to fetch posts");
    return await res.json;
}