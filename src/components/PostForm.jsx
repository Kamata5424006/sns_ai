import { useState } from "react";
import submit from "";

export default function PostForm(){
    const [text, setText] = useState("");
    
    // eはSyntheticEvent
    function handlePost(e){
        e.preventDefault(); // formのページ遷移を防止
        // str.trim():先頭と末尾のホワイトスペースを取り除く
        if(!text.trim()) return; // 空投稿防止
        submit(text); 
        setText("");
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
                            // valueが変化する毎レンダーし直す
                            onChange={e => setText(e.target.value)}
                            onKeyDown={e => {
                                if(e.key === "Enter"){
                                    e.preventDefault();
                                }
                            }}
                        >
                            What's happening?
                        </textarea>
                        <button type="submit" id="post">Post</button>
                    </form>
                </div>
            </div>
        </div>
    );
}