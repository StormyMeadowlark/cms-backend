const Post = require("../models/Post");
const mongoose = require("mongoose");
const axios = require("axios");

exports.createPost = async (req, res) => {
  console.log(
    `[POST /:tenantId] Starting post creation for tenantId: ${req.params.tenantId}, userId: ${req.user._id}`
  );
  try {
    const { tenantId } = req.params.tenantId;
    const { title, content } = req.body;

    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: "Unauthorized: No valid user ID." });
    }

    const post = new Post({
      title,
      content,
      author: req.user._id, // Correctly use the userId from req.user
      tenantId: req.params.tenantId,
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

exports.getAllPosts = async (req, res) => {
  const { tenantId } = req.params; // Extract tenantId from params for logging
  const { "x-tenant-id": xTenantId } = req.headers; // Destructure headers for cleaner code

  console.log(
    `[POST /:tenantId] Starting post gathering for tenantId: ${tenantId}`
  );

  try {
    console.log(
      `[CONTROLLER] Fetching all published posts for tenantId: ${xTenantId}`
    );

    // Validate that the tenant ID is provided in the headers
    if (!xTenantId) {
      console.error("[CONTROLLER] Tenant ID is missing in the headers.");
      return res.status(400).json({ error: "X-Tenant-Id header is required" });
    }

    // Fetch posts from the database where tenantId matches and status is Published
    const posts = await Post.find({
      tenantId: xTenantId,
      publishStatus: "Published",
    });

    if (!posts.length) {
      console.log("[CONTROLLER] No published posts found for this tenant.");
      return res.status(404).json({ error: "No published posts found" });
    }

    console.log("[CONTROLLER] Published posts retrieved successfully:", posts);
    res.status(200).json(posts);
  } catch (error) {
    console.error("[CONTROLLER] Error fetching posts:", error.message);
    res.status(500).json({ error: "An error occurred while fetching posts." });
  }
};

exports.getPostById = async (req, res) => {
  console.log(
    `[POST /:tenantId/:postId] Starting to get posts tenantId: ${req.params.tenantId} for post ID: ${req.params.postId}`
  );
  try {
    const postId = req.params.postId;
    const tenantId = req.params.tenantId;

    console.log(
      `[CONTROLLER] Fetching post ID ${postId} for tenantId: ${tenantId}`
    );

    // Find the post by ID and tenant ID, and ensure it is published
    const post = await Post.findOne({
      _id: postId,
      tenantId,
      publishStatus: "Published",
    });

    if (!post) {
      console.log("[CONTROLLER] Post not found or not published");
      return res.status(404).json({ error: "Post not found or not published" });
    }

    console.log("[CONTROLLER] Post retrieved successfully:", post);
    res.status(200).json(post);
  } catch (error) {
    console.error("[CONTROLLER] Error fetching post:", error.message);
    res.status(500).json({ error: "Error fetching post" });
  }
};



exports.updatePost = async (req, res) => {
  console.log(
    `[POST /:tenantId] Starting post update for tenantId: ${req.params.tenantId}, post ID: ${req.params.id}`
  );
  try {
    console.log(
      `[CONTROLLER] Updating post ID ${req.params.id} for tenantId: ${req.params.tenantId}`
    );
    console.log("[CONTROLLER] Request body:", req.body);

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

exports.deletePost = async (req, res) => {
  console.log(
    `[POST /:tenantId] Starting post removal for tenantId: ${req.params.tenantId}, userId: ${req.user._id}, Post Id: ${req.params.id}`
  );
  try {
    console.log(
      `[CONTROLLER] Deleting post ID ${req.params.id} for tenantId: ${req.params.tenantId}`
    );

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
