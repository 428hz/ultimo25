import React, { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { addComment, listCommentsByPost, type Comment } from '@/services/comments';

export function useComments(postId: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await listCommentsByPost(postId);
      setLoading(false);
      if (!res.ok) {
        Alert.alert('Error', res.message);
        return;
      }
      setComments(res.data);
    })();
  }, [postId]);

  const submit = async (content: string) => {
    const res = await addComment(postId, content);
    if (!res.ok) {
      Alert.alert('Error', res.message);
      return;
    }
    setComments((prev) => [...prev, res.data]);
  };

  return { comments, loading, submit };
}