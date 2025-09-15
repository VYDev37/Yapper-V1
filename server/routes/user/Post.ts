import { Hono } from "hono";

import Authorization from "../../middlewares/Authorization";
import PostController from "../../controllers/PostController";

const PostRouter: Hono = new Hono();

// Reading posts
PostRouter.get('/get-posts', Authorization, PostController.GetPosts);
//PostRouter.get('/get-comments/:postId', Authorization, PostController.GetComments);
//PostRouter.get('/get-post/:ownerId/:id', Authorization, PostController.GetSpecificPost);

PostRouter.post('/add-post', Authorization, PostController.AddPost);
PostRouter.post('/add-like/:id', Authorization, PostController.AddLike);
PostRouter.post('/add-comment', Authorization, PostController.AddComment);
PostRouter.post('/add-comment-like', Authorization, PostController.LikeComment);
PostRouter.post('/delete-post/:id', Authorization, PostController.DeletePost);
PostRouter.post('/delete-comment/:commentId/:postId', Authorization, PostController.DeleteComment);

export default PostRouter;