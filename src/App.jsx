import Header from "./components/Header";
import PostLists from "./components/PostLists";
import PostForm from "./components/PostForm";
import AiController from "./components/AiController";

export default function App(){
    return (
        <>
            <Header />
            <AiController />
            <PostLists />
            <PostForm />
        </>
    );
}