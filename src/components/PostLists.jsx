import { useEffect, useState } from "react";
import { fetchPosts } from "../lib/api";

export default function PostLists(){
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        fetchPosts()
            .then(data => setPosts(data))
            .catch(err => console.error(err));
    }, []);

    return (
        <div className="PostLists">
            <ul>
                {posts.map(p => (
                    <li key={p.id}>
                        <article className="post_frame">
                            <div className="post">
                                <div className="post_top"></div>
                                <div className="post_icon">
                                    <img
                                        // `:+を使わず変数を埋め込める
                                        src={`/img/${p.author.toLowerCase()}.png`}
                                        alt={p.author}
                                        className="icon"
                                    />
                                </div>
                                <div className="post_body">
                                    <div className="name_frame">
                                        <span className="name">{p.author}</span>
                                    </div>

                                    <div className="contents_frame">
                                        <p className="contents">
                                            {p.text}
                                        </p>
                                    </div>

                                    <div className="reply_frame">
                                        <button className="reply">返信</button>
                                    </div>
                                </div>
                            </div>
                        </article>
                    </li>
                ))}
            </ul>
        </div>
    );
}