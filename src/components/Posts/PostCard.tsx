import React, { useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import ConfirmDialog from '@/components/ConfirmDialog';
import PostHeader from './PostHeader';
import PostMedia from './PostMedia';
import PostActions from './PostActions';
import CommentsList from './Comments/CommentsList';
import CommentInput from './Comments/CommentInput';
import { useComments, useLikes, useNormalizedPostId } from './hooks';
import type { PostProps } from './types';
import { isModerator } from '@/utils/rbac';
import { deletePost } from '@/services/posts';

export default function PostCard({ postData, onDelete }: PostProps) {
  const { session, profile } = useAuth();
  const userId = session?.user?.id || undefined;

  const postId = useNormalizedPostId(postData.id);
  const isOwner = userId === postData.author_id;

  // RBAC: moderador o admin también pueden borrar
  const canModerate = isModerator(profile?.role as any);
  const canDeletePost = isOwner || canModerate;

  const { likesCount, liked, toggle, reload: reloadLikes } = useLikes(postId, userId);
  const { comments, commentsCount, add, remove, load: reloadComments } = useComments(postId);
  const [showComments, setShowComments] = useState(true);
  const [newComment, setNewComment] = useState('');

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [deletingPost, setDeletingPost] = useState(false);

  const [confirmCommentVisible, setConfirmCommentVisible] = useState(false);
  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(null);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);

  useEffect(() => {
    reloadLikes();
    reloadComments();
  }, [reloadLikes, reloadComments]);

  const likesText = useMemo(() => `${likesCount} ${likesCount === 1 ? 'me gusta' : 'me gusta'}`, [likesCount]);

  const handleDeletePost = async () => {
    try {
      setDeletingPost(true);
      const res = await deletePost(String(postId));
      if (!res.ok) {
        Alert.alert('Error', res.message);
        return;
      }
      onDelete?.(postId);
    } finally {
      setDeletingPost(false);
      setConfirmVisible(false);
    }
  };

  const requestDeleteComment = (id: string) => {
    setSelectedCommentId(id);
    setConfirmCommentVisible(true);
  };

  const handleDeleteComment = async () => {
    if (!selectedCommentId) return;
    try {
      setDeletingCommentId(selectedCommentId);
      await remove(selectedCommentId);
    } finally {
      setDeletingCommentId(null);
      setSelectedCommentId(null);
      setConfirmCommentVisible(false);
    }
  };

  const handleAddComment = async () => {
    if (!userId || !newComment.trim()) return;
    const ok = await add(newComment, userId);
    if (!ok) {
      Alert.alert('No se pudo comentar', 'Revisa tu conexión o las políticas de comments.');
      return;
    }
    setNewComment('');
  };

  return (
    <View style={styles.card}>
      <PostHeader
        profile={postData.profiles}
        authorFallback={postData.author_id}
        isOwner={!!canDeletePost}
        deleting={deletingPost}
        onPressDelete={() => setConfirmVisible(true)}
      />

      <PostMedia uri={postData.media_url} />

      <PostActions
        liked={liked}
        likesText={likesText}
        onToggleLike={toggle}
        onToggleComments={() => setShowComments((v) => !v)}
      />

      {!!postData.text_content && (
        <View style={styles.captionWrap}>
          <Text style={styles.caption}>{postData.text_content}</Text>
        </View>
      )}

      <TouchableOpacity onPress={() => setShowComments((v) => !v)}>
        <Text style={styles.viewAll}>
          {showComments ? 'Ocultar' : 'Ver'} {commentsCount} {commentsCount === 1 ? 'comentario' : 'comentarios'}
        </Text>
      </TouchableOpacity>

      {showComments && (
        <>
          <CommentsList
            comments={comments}
            currentUserId={userId}
            isPostOwner={!!canDeletePost}
            deletingCommentId={deletingCommentId}
            onRequestDelete={requestDeleteComment}
          />
          <CommentInput
            value={newComment}
            onChange={setNewComment}
            onSubmit={handleAddComment}
            disabled={!userId}
          />
        </>
      )}

      <ConfirmDialog
        visible={confirmVisible}
        title="Eliminar publicación"
        message="¿Seguro que deseas eliminar esta publicación? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        loading={deletingPost}
        onConfirm={handleDeletePost}
        onCancel={() => !deletingPost && setConfirmVisible(false)}
      />

      <ConfirmDialog
        visible={confirmCommentVisible}
        title="Eliminar comentario"
        message="¿Seguro que deseas eliminar este comentario?"
        confirmText="Eliminar"
        cancelText="Cancelar"
        loading={!!deletingCommentId}
        onConfirm={handleDeleteComment}
        onCancel={() => {
          if (!deletingCommentId) {
            setSelectedCommentId(null);
            setConfirmCommentVisible(false);
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    maxWidth: 614,
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: '#363636',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  captionWrap: { paddingHorizontal: 10, paddingVertical: 8 },
  caption: { color: '#eaeaea', fontSize: 14 },
  viewAll: { color: '#a8a8a8', paddingHorizontal: 10, paddingBottom: 6 },
});