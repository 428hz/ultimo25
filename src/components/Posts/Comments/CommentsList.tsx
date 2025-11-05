import React from 'react';
import { View } from 'react-native';
import CommentItem from './CommentItem';
import type { Comment } from '../types';

type Props = {
  comments: Comment[];
  currentUserId?: string;
  isPostOwner: boolean;
  deletingCommentId?: string | null;
  onRequestDelete: (id: string) => void;
};

export default function CommentsList({
  comments,
  currentUserId,
  isPostOwner,
  deletingCommentId,
  onRequestDelete,
}: Props) {
  return (
    <View>
      {comments.map((c) => {
        const canDelete = !!currentUserId && (c.author_id === currentUserId || isPostOwner);
        const deleting = deletingCommentId === c.id;
        return (
          <CommentItem
            key={c.id}
            comment={c}
            canDelete={canDelete}
            deleting={deleting}
            onDelete={onRequestDelete}
          />
        );
      })}
    </View>
  );
}