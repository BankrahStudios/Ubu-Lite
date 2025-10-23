import React from 'react';

type Props = {
  title: string;
  price?: number;
  category?: string;
  seller?: string;
  rating?: number;
  imageUrl?: string;
  onClick?: () => void;
};

const GigCard: React.FC<Props> = ({ title, price, category, seller, rating, imageUrl, onClick }) => {
  const img = imageUrl || 'https://via.placeholder.com/600x400?text=Gig';
  return (
    <div className="gig-card" onClick={onClick} role="button" tabIndex={0}>
      <div className="gig-thumb">
        <img src={img} alt={title} />
      </div>
      <div className="gig-body">
        <div className="gig-seller">{seller || 'Creative'}</div>
        <div className="gig-title" title={title}>{title}</div>
        <div className="gig-meta">
          <span className="gig-category">{category}</span>
          {typeof rating === 'number' && <span className="gig-rating">★ {rating.toFixed(1)}</span>}
        </div>
      </div>
      <div className="gig-footer">
        <span className="gig-from">From</span>
        <span className="gig-price">${price ?? 0}</span>
      </div>
    </div>
  );
};

export default GigCard;

