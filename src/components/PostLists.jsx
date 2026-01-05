export default function PostLists(){
    return (
        <div className="PostLists">
            <article className="post_frame">
                <div className="post">
                    <div className="post_top"></div>
                    <div className="post_icon">
                        <img
                            src="/img/user.png"
                            alt="You"
                            className="icon"
                        />
                    </div>

                    <div className="post_body">
                        <div className="name_frame">
                            <span className="name">You</span>
                        </div>

                        <div className="contents_frame">
                            <p className="contents">
                                Hello World!
                            </p>
                        </div>

                        <div className="reply_frame">
                            <button className="reply">返信</button>
                        </div>
                    </div>
                </div>
            </article>
        </div>
    );
}