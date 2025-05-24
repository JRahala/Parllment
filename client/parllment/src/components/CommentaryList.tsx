import React from 'react';
import type { Commentator } from '../interfaces/Commentator';

interface CommentatorItemProps {
  commentator: Commentator;
}

const CommentatorItem: React.FC<CommentatorItemProps> = ({ commentator }) => (
  <div className="commentary-item">
    <div className="col col-image">
      {commentator.imageUrl && (
        <img src={commentator.imageUrl} alt={commentator.name} />
      )}
    </div>
    <div className="col col-info">
      <div className="commentator-name">{commentator.name}</div>
      <div className="commentator-assoc">{commentator.associations}</div>
    </div>
    <div className="col col-interests" title={commentator.interests}>
      {commentator.interests.length > 30
        ? `${commentator.interests.slice(0, 30)}…`
        : commentator.interests}
    </div>
  </div>
);

interface CommentaryListProps {
  commentators: Commentator[];
}

export const CommentaryList: React.FC<CommentaryListProps> = ({ commentators }) => (
  <div className="commentary-list">
    {commentators.map((c) => (
      <CommentatorItem key={c.name} commentator={c} />
    ))}
  </div>
);
