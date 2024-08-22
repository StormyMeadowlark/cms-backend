// controllers/postController.js

const Post = require("../models/Post");
exports.createPost = async (req, res) => {
  try {
    const {
      title,
      content,
      categories,
      tags,
      metaTitle,
      metaDescription,
      metaKeywords,
      media,
    } = req.body;

    // Verify that req.user._id is available
    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: "Unauthorized: Invalid user." });
    }

    const post = new Post({
      title,
      content,
      author: req.user._id, // Set the author as the authenticated user
      categories,
      tags,
      metaTitle,
      metaDescription,
      metaKeywords,
      media,
      publishStatus: "Draft",
    });

    // Save the post to the database
    await post.save();

    // Respond with the created post
    res.status(201).json(post);
  } catch (error) {
    console.error("Error creating post:", error.message);
    res.status(500).json({ error: "Error creating post" });
  }
};

// Get all posts (published)
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find({ publishStatus: "Published" })
      .populate("author", "username")
      .populate("categories", "name")
      .populate("tags", "name")
      .populate("media", "url");

    console.log("Retrieved posts:", posts); // Log retrieved posts
    res.status(200).json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ error: "Error fetching posts" });
  }
};


// Get a post by ID
exports.getPostById = async (req, res) => {
  try {
    const postId = req.params.id;

    // Validate the post ID
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ error: "Invalid post ID" });
    }

    const post = await Post.findById(postId)
      .populate("author", "username")
      .populate("categories", "name")
      .populate("tags", "name")
      .populate("media", "url");

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    res.status(200).json(post);
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({ error: "Error fetching post" });
  }
};

// Update a post
exports.updatePost = async (req, res) => {
  try {
    const {
      title,
      content,
      categories,
      tags,
      metaTitle,
      metaDescription,
      metaKeywords,
      media,
    } = req.body;

    const post = await Post.findByIdAndUpdate(
      req.params.id,
      {
        title,
        content,
        categories,
        tags,
        metaTitle,
        metaDescription,
        metaKeywords,
        media,
      },
      { new: true }
    );

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ error: "Error updating post" });
  }
};

// Delete a post
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting post" });
  }
};

// Publish a post
exports.publishPost = async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { publishStatus: "Published", publishDate: Date.now() },
      { new: true }
    );

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ error: "Error publishing post" });
  }
};

// Unpublish a post
exports.unpublishPost = async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { publishStatus: "Draft" },
      { new: true }
    );

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ error: "Error unpublishing post" });
  }
};
exports.likePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Check if user already liked the post
    if (post.likes.includes(userId)) {
      return res
        .status(400)
        .json({ error: "You have already liked this post" });
    }

    // Remove user from dislikes array if they had previously disliked the post
    post.dislikes.pull(userId);

    // Add user to likes array
    post.likes.push(userId);

    await post.save();
    res.status(200).json(post);
  } catch (error) {
    console.error("Error liking post:", error);
    res.status(500).json({ error: "Error liking post" });
  }
};

// Dislike a post
exports.dislikePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Check if user already disliked the post
    if (post.dislikes.includes(userId)) {
      return res
        .status(400)
        .json({ error: "You have already disliked this post" });
    }

    // Remove user from likes array if they had previously liked the post
    post.likes.pull(userId);

    // Add user to dislikes array
    post.dislikes.push(userId);

    await post.save();
    res.status(200).json(post);
  } catch (error) {
    console.error("Error disliking post:", error);
    res.status(500).json({ error: "Error disliking post" });
  }
  exports.savePost = async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
      const post = await Post.findById(req.params.postId);

      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }

      // Check if the post is already saved
      if (user.savedPosts.includes(post._id)) {
        return res.status(400).json({ error: "Post already saved" });
      }

      user.savedPosts.push(post._id);
      await user.save();

      res.status(200).json({ message: "Post saved successfully" });
    } catch (error) {
      console.error("Error saving post:", error);
      res.status(500).json({ error: "Error saving post" });
    }
  };

  // Unsave a post
  exports.unsavePost = async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
      const post = await Post.findById(req.params.postId);

      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }

      user.savedPosts.pull(post._id);
      await user.save();

      res.status(200).json({ message: "Post unsaved successfully" });
    } catch (error) {
      console.error("Error unsaving post:", error);
      res.status(500).json({ error: "Error unsaving post" });
    }
  };

  // Get saved posts
  exports.getSavedPosts = async (req, res) => {
    try {
      const user = await User.findById(req.user._id).populate("savedPosts");

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.status(200).json(user.savedPosts);
    } catch (error) {
      console.error("Error fetching saved posts:", error);
      res.status(500).json({ error: "Error fetching saved posts" });
    }
  };
};