import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';

export default function Posts() {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState('');
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const token = Cookies.get('token');
        const res = await fetch('http://34.47.206.67:8081/posts', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await res.json();

        if (res.ok) {
          setPosts(data);
        } else {
          setError(data.message || 'Failed to fetch posts');
        }
      } catch (err) {
        setError('Network error. Please try again.');
        console.error('Error fetching posts:', err);
      }
    };

    fetchPosts();
  }, []);

  useEffect(() => {
    const pollNotifications = async () => {
      try {
        const token = Cookies.get('token');
        const res = await fetch('http://localhost:8082/notify', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await res.json();

        if (res.ok) {
          setNotifications(data);
        } else {
          console.error('Failed to fetch notifications');
        }
      } catch (err) {
        console.error('Error fetching notifications:', err);
      }
    };

    const intervalId = setInterval(pollNotifications, 60000); // Poll every minute

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);

  const Post = ({ post }) => {
    const [comment, setComment] = useState('');
    const [review, setReview] = useState('');

    const handleCommentSubmit = async (e) => {
      e.preventDefault();
      if (comment.trim()) {
        try {
          const token = Cookies.get('token');
          const res = await fetch('http://34.47.206.67:8081/comment', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              post_id: post.id,
              content: comment,
            }),
          });

          if (res.ok) {
            const newComment = await res.json();
            if (!post.comments) {
              post.comments = [];
            }
            post.comments.push(newComment);
            setComment('');
          } else {
            console.error('Failed to submit comment');
          }
        } catch (err) {
          console.error('Error submitting comment:', err);
        }
      }
    };

    const handleReviewSubmit = async (e) => {
      e.preventDefault();
      if (review.trim()) {
        try {
          const token = Cookies.get('token');
          const res = await fetch('http://34.47.206.67:8081/review', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              post_id: post.id,
              content: review,
            }),
          });

          if (res.ok) {
            const newReview = await res.json();
            if (!post.reviews) {
              post.reviews = [];
            }
            post.reviews.push(newReview);
            setReview('');
          } else {
            console.error('Failed to submit review');
          }
        } catch (err) {
          console.error('Error submitting review:', err);
        }
      }
    };

    return (
      <div className="post">
        <h3>{post.content}</h3>
        <p>Likes: {post.likes}</p>
        <p>Created at: {new Date(post.created_at).toLocaleString()}</p>
        <p>Posted by: {post.user.username}</p>
        
        <div className="comments">
          <h4>Comments</h4>
          <ul>
            {post.comments && post.comments.map((c) => (
              <li key={c.id}>
                <strong>{c.user.username}:</strong> {c.content}
              </li>
            ))}
          </ul>
          <form onSubmit={handleCommentSubmit}>
            <input 
              type="text" 
              value={comment} 
              onChange={(e) => setComment(e.target.value)} 
              placeholder="Add a comment" 
              required 
            />
            <div className="buttons">
              <button type="submit" className="comment-button">
                <span className="icon">💬</span> Comment
              </button>
            </div>
          </form>
        </div>

        <div className="reviews">
          <h4>Reviews</h4>
          <ul>
            {post.reviews && post.reviews.map((r) => (
              <li key={r.id}>
                <strong>{r.user.username}:</strong> {r.content}
              </li>
            ))}
          </ul>
          <form onSubmit={handleReviewSubmit}>
            <input 
              type="text" 
              value={review} 
              onChange={(e) => setReview(e.target.value)} 
              placeholder="Add a review" 
              required 
            />
            <div className="buttons">
              <button type="submit" className="review-button">
                <span className="icon">⭐</span> Review
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
  <div className="posts-container">
    {error && <div className="error-message">{error}</div>}
    
    {notifications.length > 0 && (
      <div className="notifications">
        {notifications.map((notification) => (
          <div key={notification.username} className={`notification ${notification.severity}`}>
            <strong>{notification.severity}</strong>: {notification.content}
          </div>
        ))}
      </div>
    )}

    {posts.length > 0 ? (
      <div className="posts-list">
        {posts.map((post) => (
          <Post key={post.id} post={post} />
        ))}
      </div>
    ) : (
      <p>No posts available.</p>
    )}
    
    <style jsx>{`
      .posts-container {
        padding: 20px;
        max-width: 800px;
        margin: 0 auto;
        font-family: Arial, sans-serif;
      }

      .notifications {
        margin-bottom: 20px;
      }

      .notification {
        padding: 15px;
        border-radius: 5px;
        margin-bottom: 10px;
        font-size: 14px;
      }

      .notification.high {
        background-color: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
      }

      .notification.medium {
        background-color: #fff3cd;
        color: #856404;
        border: 1px solid #ffeeba;
      }

      .notification.low {
        background-color: #d4edda;
        color: #155724;
        border: 1px solid #c3e6cb;
      }

      .notification strong {
        font-weight: bold;
      }

      .post {
        border: 1px solid #ddd;
        padding: 20px;
        margin-bottom: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        background-color: #fff;
      }

      .post h3 {
        margin-top: 0;
        color: #333;
      }

      .post p {
        color: #666;
      }

      .comments, .reviews {
        margin-top: 20px;
      }

      .comments h4, .reviews h4 {
        margin-bottom: 10px;
        color: #0070f3;
      }

      .comments ul, .reviews ul {
        list-style-type: none;
        padding: 0;
      }

      .comments li, .reviews li {
        background: #f9f9f9;
        padding: 10px;
        margin-bottom: 10px;
        border-radius: 5px;
      }

      .comments form, .reviews form {
        display: flex;
        flex-direction: column;
        margin-top: 10px;
      }

      .comments input, .reviews input {
        flex: 1;
        padding: 10px;
        margin-bottom: 10px;
        border: 1px solid #ddd;
        border-radius: 5px;
      }

      .buttons {
        display: flex;
        gap: 10px;
      }

      .comment-button, .review-button {
        padding: 10px 15px;
        border: none;
        background-color: #0070f3;
        color: white;
        border-radius: 5px;
        cursor: pointer;
        display: flex;
        align-items: center;
      }

      .comment-button:hover, .review-button:hover {
        background-color: #005bb5;
      }

      .icon {
        margin-right: 5px;
      }

      .error-message {
        color: red;
        margin-bottom: 20px;
      }
    `}</style>
  </div>
);

}
