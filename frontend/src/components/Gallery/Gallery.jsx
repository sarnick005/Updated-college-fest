import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../utils/AuthContext";
import {
  Box,
  Button,
  Text,
  Heading,
  Center,
  SimpleGrid,
} from "@chakra-ui/react";
import Header from "../header";
import GalleryCard from "./GalleryCard";

const Gallery = () => {
  const [galleryPosts, setGalleryPosts] = useState([]);
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [loggedInUserType, setLoggedInUserType] = useState(null);
  const { isLoggedIn, user } = useAuth();

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
        setLoggedInUserId(user._id);
        setLoggedInUserType(user.userType);
      } catch (error) {
        console.error("Error fetching logged in user:", error);
      }
    };

    fetchPosts();

    if (isLoggedIn) {
      fetchLoggedInUser();
    }
  }, [isLoggedIn]);

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
    <Box style={{ backgroundColor: "black" }}>
      <Header />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <Center>
        <Heading style={{ color: "white" }} as="h3" size="lg" mb={8} mt={8}>
          Gallery
        </Heading>
      </Center>
      <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={8} padding={4}>
        {galleryPosts.map((post) => (
          <Box
            key={post._id}
            p={4}
            borderWidth="1px"
            borderRadius="lg"
            overflow="hidden"
            boxShadow="md"
            bg="white"
          >
            <GalleryCard
              media={post.postedContent}
              description={post.description}
            />
            <Text fontWeight="bold">Username: {post.username}</Text>
            <Text>Caption: {post.caption}</Text>
            <Text>Description: {post.description}</Text>
            {loggedInUserId === post.userId || loggedInUserType === "ADMIN" ? (
              <Button
                mt={4}
                colorScheme="red"
                onClick={() => handleDeleteButton(post._id)}
              >
                Delete
              </Button>
            ) : null}
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default Gallery;
