import Post from "../models/Post.js";
import User from "../models/User.js";
/* CREATE */

export const createPost = async (req, resp) => {
    try {
        const { userId, description, picturePath } = req.body;
        const user = await User.findById(userId);
        const newPost = new Post({
            userId,
            firstName: user.firstName,
            lastName: user.lastName,
            location: user.location,
            description,
            userPicturePath: user.picturePath,
            picturePath,
            likes: {},
            comments: []
        })

        await newPost.save();

        const post = await Post.find();
        resp.status(201).json(post);

    } catch (error) {
        resp.status(409).json({ message: error.message })
    }
}

/* READ */

export const getFeedPosts = async (req, resp) => {
    try {
        const post = await Post.find();
        resp.status(200).json(post);
    } catch (error) {
        resp.status(404).json({ message: error.message })
    }
}

export const getUserPosts = async (req, resp) => {
    try {
        const { userId } = req.params;
        const post = await Post.find({ userId });
        resp.status(200).json(post);
    } catch (error) {
        resp.status(404).json({ message: error.message })
    }
}

/* UPDATE */

export const likePost = async (req, resp) => {
    try {
        const { id } = req.params;
        const { userId } = req.body;
        const post = await Post.findById(id);

        /* This line assumes that the post object has a likes property, which is a Map object that stores the 
         user IDs and their like status for the post. The get method of the Map object returns the value
         associated with a given key, or undefined if the key is not present. In this case, the key is the userId
         and the value is a boolean that indicates whether the user liked the post or not. The isLiked variable
         will store this boolean value, or undefined if the user ID is not in the map. */
        const isLiked = post.likes.get(userId);

        if (isLiked) {
            post.likes.delete(userId);
        } else {
            post.likes.set(userId, true);
        }

        const updatedPost = await Post.findByIdAndUpdate(
            id,
            {likes:post.likes},
            {new:true}
        )

        resp.status(200).json(updatedPost);
    } catch (error) {
        resp.status(404).json({ message: error.message })
    }
}