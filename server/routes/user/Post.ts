import { Hono } from "hono";

import Authorization from "../../middlewares/Authorization";
import PostController from "../../controllers/PostController";

const PostRouter: Hono = new Hono();

// Reading posts
PostRouter.get('/get-posts', Authorization, PostController.GetPosts);

PostRouter.post('/add-post', Authorization, PostController.AddPost);
PostRouter.post('/add-like/:id', Authorization, PostController.AddLike);

PostRouter.delete('/delete-post/:id', Authorization, PostController.DeletePost)

export default PostRouter;