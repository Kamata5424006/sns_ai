import { useState } from "react";
import { submit } from "../lib/api";

export default function PostForm(){
    const [text, setText] = useState("");
    
    // eはSyntheticEvent
    async function handlePost(e){
        e.preventDefault(); // formのページ遷移を防止
        // str.trim():先頭と末尾のホワイトスペースを取り除く
        if(!text.trim()) return; // 空投稿防止

        try {
            await submit(text); 
            setText("");
        } catch(err){   /* errはどんな名前でもよい */
            // 失敗した時の挙動
            alert(err.message);
        }
    }
    
    return (
        <div id="PostForm">
            <div className="post_icon">
                <img
                    src="/img/user.png"
                    alt="You"
                    className="icon"
                />
            </div>

            <div id="form_body">
                <div className="input_frame">
                    {/* onSubmit:送信時にJavaScriptを実行 */}
                    <form onSubmit={handlePost}> 
                        <textarea
                            id="form_input"
                            name="form_input"
                            value={text}
                            placeholder="What's happening?"
                            // valueが変化する毎レンダーし直す
                            onChange={e => setText(e.target.value)}
                            onKeyDown={e => {
                                if(e.key === "Enter"){
                                    e.preventDefault();
                                }
                            }}
                        />
                        <button type="submit" id="post">Post</button>
                    </form>
                </div>
            </div>
        </div>
    );
}