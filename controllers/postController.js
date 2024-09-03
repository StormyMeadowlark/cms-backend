const Post = require("../models/Post");
const mongoose = require("mongoose");

// Create a post
exports.createPost = async (req, res) => {
  console.log(
    `[POST /:tenantId] Starting post creation for tenantId: ${req.params.tenantId}, userId: ${req.user._id}`
  );
  try {
    const { tenantId } = req.params;
    const { title, content } = req.body;

    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: "Unauthorized: No valid user ID." });
    }

    const post = new Post({
      title,
      content,
      author: req.user._id,
      tenantId,
      publishDate: Date.now(),
      publishStatus: "Draft", // Default status
    });

    await post.save();
    console.log("[CONTROLLER] Post created successfully:", post);
    res.status(201).json(post);
  } catch (error) {
    console.error("[CONTROLLER] Error creating post:", error.message);
    res.status(500).json({ error: "Error creating post" });
  }
};

// Get all posts for a tenant, with optional status filtering
exports.getAllPosts = async (req, res) => {
  const { tenantId } = req.params;
  const { status } = req.query; // Get the status query parameter

  console.log(
    `[POST /:tenantId] Starting post gathering for tenantId: ${tenantId} with status: ${
      status || "all"
    }`
  );

  try {
    const query = { tenantId };

    // Only filter by status if it's explicitly "Published" or "Draft"
    if (status === "Published" || status === "Draft") {
      query.publishStatus = status;
    }

    // Fetch posts based on the query
    const posts = await Post.find(query).sort({ createdAt: -1 }).lean();

    if (!posts.length) {
      console.log("[CONTROLLER] No posts found for this tenant.");
      return res.status(404).json({ error: "No posts found" });
    }

    console.log("[CONTROLLER] Posts retrieved successfully:", posts);
    res.status(200).json(posts);
  } catch (error) {
    console.error("[CONTROLLER] Error fetching posts:", error.message);
    res.status(500).json({ error: "An error occurred while fetching posts." });
  }
};



// Get a specific post by ID
exports.getPostById = async (req, res) => {
  console.log(
    `[POST /:tenantId/:postId] Starting to get posts for tenantId: ${req.params.tenantId}, post ID: ${req.params.postId}`
  );
  try {
    const { tenantId, postId } = req.params;

    console.log(
      `[CONTROLLER] Fetching post ID ${postId} for tenantId: ${tenantId}`
    );

    const post = await Post.findOne({ _id: postId, tenantId });

    if (!post) {
      console.log("[CONTROLLER] Post not found");
      return res.status(404).json({ error: "Post not found" });
    }

    console.log("[CONTROLLER] Post retrieved successfully:", post);
    res.status(200).json(post);
  } catch (error) {
    console.error("[CONTROLLER] Error fetching post:", error.message);
    res.status(500).json({ error: "Error fetching post" });
  }
};

// Update a post
exports.updatePost = async (req, res) => {
  console.log(
    `[POST /:tenantId] Starting post update for tenantId: ${req.params.tenantId}, post ID: ${req.params.id}`
  );
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
      console.log("[CONTROLLER] Post not found");
      return res.status(404).json({ error: "Post not found" });
    }

    console.log("[CONTROLLER] Post updated successfully:", post);
    res.status(200).json(post);
  } catch (error) {
    console.error("[CONTROLLER] Error updating post:", error.message);
    res.status(500).json({ error: "Error updating post" });
  }
};

// Delete a post
exports.deletePost = async (req, res) => {
  console.log(
    `[POST /:tenantId] Starting post removal for tenantId: ${req.params.tenantId}, userId: ${req.user._id}, post ID: ${req.params.id}`
  );
  try {
    const post = await Post.findByIdAndDelete(req.params.id);

    if (!post) {
      console.log("[CONTROLLER] Post not found");
      return res.status(404).json({ error: "Post not found" });
    }

    console.log("[CONTROLLER] Post deleted successfully:", post);
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("[CONTROLLER] Error deleting post:", error.message);
    res.status(500).json({ error: "Error deleting post" });
  }
};

// Publish a post
exports.publishPost = async (req, res) => {
  try {
    console.log(
      `[CONTROLLER] Publishing post ID ${req.params.id} for tenantId: ${req.params.tenantId}`
    );

    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { publishStatus: "Published", publishDate: Date.now() },
      { new: true }
    );

    if (!post) {
      console.log("[CONTROLLER] Post not found");
      return res.status(404).json({ error: "Post not found" });
    }

    console.log("[CONTROLLER] Post published successfully:", post);
    res.status(200).json(post);
  } catch (error) {
    console.error("[CONTROLLER] Error publishing post:", error.message);
    res.status(500).json({ error: "Error publishing post" });
  }
};

// Unpublish a post
exports.unpublishPost = async (req, res) => {
  try {
    console.log(
      `[CONTROLLER] Unpublishing post ID ${req.params.id} for tenantId: ${req.params.tenantId}`
    );

    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { publishStatus: "Draft" },
      { new: true }
    );

    if (!post) {
      console.log("[CONTROLLER] Post not found");
      return res.status(404).json({ error: "Post not found" });
    }

    console.log("[CONTROLLER] Post unpublished successfully:", post);
    res.status(200).json(post);
  } catch (error) {
    console.error("[CONTROLLER] Error unpublishing post:", error.message);
    res.status(500).json({ error: "Error unpublishing post" });
  }
};

// Like a post
exports.likePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;
    console.log(
      `[CONTROLLER] Liking post ID ${postId} for tenantId: ${req.params.tenantId} by user ${userId}`
    );

    const post = await Post.findById(postId);

    if (!post) {
      console.log("[CONTROLLER] Post not found");
      return res.status(404).json({ error: "Post not found" });
    }

    if (post.likes.includes(userId)) {
      console.log("[CONTROLLER] User already liked this post");
      return res
        .status(400)
        .json({ error: "You have already liked this post" });
    }

    post.dislikes.pull(userId);
    post.likes.push(userId);

    await post.save();
    console.log("[CONTROLLER] Post liked successfully:", post);
    res.status(200).json(post);
  } catch (error) {
    console.error("[CONTROLLER] Error liking post:", error.message);
    res.status(500).json({ error: "Error liking post" });
  }
};

// Dislike a post
exports.dislikePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;
    console.log(
      `[CONTROLLER] Disliking post ID ${postId} for tenantId: ${req.params.tenantId} by user ${userId}`
    );

    const post = await Post.findById(postId);

    if (!post) {
      console.log("[CONTROLLER] Post not found");
      return res.status(404).json({ error: "Post not found" });
    }

    if (post.dislikes.includes(userId)) {
      console.log("[CONTROLLER] User already disliked this post");
      return res
        .status(400)
        .json({ error: "You have already disliked this post" });
    }

    post.likes.pull(userId);
    post.dislikes.push(userId);

    await post.save();
    console.log("[CONTROLLER] Post disliked successfully:", post);
    res.status(200).json(post);
  } catch (error) {
    console.error("[CONTROLLER] Error disliking post:", error.message);
    res.status(500).json({ error: "Error disliking post" });
  }
};
