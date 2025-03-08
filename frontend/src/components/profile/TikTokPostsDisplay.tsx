import React, { useState, useEffect } from 'react';
import { useApi } from '../../services/api';
import { formatDistanceToNow } from 'date-fns';

interface TikTokPost {
  id: string;
  title: string;
  share_url: string;
  thumbnail_url: string;
  created_at: string;
  view_count: number;
  like_count: number;
  comment_count: number;
}

interface TikTokPostsDisplayProps {
  userId: string;
}

const TikTokPostsDisplay: React.FC<TikTokPostsDisplayProps> = ({ userId }) => {
  const [posts, setPosts] = useState<TikTokPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const api = useApi();
  
  useEffect(() => {
    const fetchTikTokPosts = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await api.get(`/users/${userId}/tiktok-posts`);
        setPosts(response.data.posts);
      } catch (err) {
        console.error('Failed to fetch TikTok posts:', err);
        setError('Failed to load TikTok posts');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTikTokPosts();
  }, [userId, api]);
  
  if (isLoading) {
    return <div className="loading-spinner">Loading TikTok posts...</div>;
  }
  
  if (error) {
    return <div className="error-message">{error}</div>;
  }
  
  if (posts.length === 0) {
    return <div className="no-posts-message">No TikTok posts found</div>;
  }
  
  return (
    <div className="tiktok-posts-grid">
      {posts.map(post => (
        <a 
          key={post.id} 
          href={post.share_url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="tiktok-post-card"
        >
          <div className="post-thumbnail">
            <img src={post.thumbnail_url} alt={post.title} />
          </div>
          <div className="post-info">
            <h4>{post.title}</h4>
            <div className="post-meta">
              <span className="post-date">
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
              </span>
              <div className="post-stats">
                <span>{post.view_count} views</span>
                <span>{post.like_count} likes</span>
                <span>{post.comment_count} comments</span>
              </div>
            </div>
          </div>
        </a>
      ))}
    </div>
  );
};

export default TikTokPostsDisplay; 