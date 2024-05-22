import React, { useState, useEffect } from "react";
import axios from "axios";
import MediaPlayer from "../utils/MediaPlayer";
import { useAuth } from "../utils/AuthContext";

const Gallery = () => {
  const [galleryPosts, setGalleryPosts] = useState([]);
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [loggedInUserType, setLoggedInUserType] = useState(null);
  const { isLoggedIn, user } = useAuth();
  const [isPageReloaded, setIsPageReloaded] = useState(1);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get("/api/v1/posts");
        const posts = response.data.data.allPosts;
        const sortedPosts = posts.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
        setGalleryPosts(sortedPosts);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };

    const fetchLoggedInUser = async () => {
      try {
        const response = await axios.get("/api/v1/users/current-user");
        const user = response.data.data;
        console.log("Logged in user");
        console.log(user);
        setLoggedInUserId(user._id);
        setLoggedInUserType(user.userType);
       
        const reloadUsingLocationHash = () => {
          window.location.hash = "reload";
        };
        window.onload = reloadUsingLocationHash(); 

     
      } catch (error) {
        console.error("Error fetching logged in user:", error);
      }
    };

    fetchPosts();

    if (isLoggedIn ) {
      fetchLoggedInUser();
    }
  }, [isLoggedIn, isPageReloaded]);

  const handleDeleteButton = async (postId) => {
    try {
      await axios.delete(`/api/v1/posts/delete/${postId}`);
      setGalleryPosts((prevPosts) =>
        prevPosts.filter((post) => post._id !== postId)
      );
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  return (
    <div>
      {galleryPosts.map((post) => (
        <div key={post._id}>
          <p>Username: {post.username}</p>
          <p>Caption: {post.caption}</p>
          <p>Description: {post.description}</p>
          <div className="gallery-posts">
            <MediaPlayer
              content={post.postedContent}
              description={post.description}
            />
          </div>
          {loggedInUserId === post.userId || loggedInUserType === "ADMIN" ? (
            <button onClick={() => handleDeleteButton(post._id)}>Delete</button>
          ) : null}{" "}
          <hr />
        </div>
      ))}
    </div>
  );
};

export default Gallery;
