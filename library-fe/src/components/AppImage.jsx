import React, { useState } from 'react';
import { resolveImageUrl } from '../utils/image';
import { PictureOutlined } from '@ant-design/icons';

const AppImage = ({ src, alt, style, fallbackText = 'No Cover', ...props }) => {
  const [hasError, setHasError] = useState(false);
  const [prevSrc, setPrevSrc] = useState(src);

  if (src !== prevSrc) {
    setHasError(false);
    setPrevSrc(src);
  }

  const resolvedSrc = resolveImageUrl(src);


  const handleError = () => {
    setHasError(true);
  };

  if (!resolvedSrc || hasError) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f1f5f9',
          color: '#94a3b8',
          width: '100%',
          height: '100%',
          ...style,
        }}
        {...props}
      >
        <PictureOutlined style={{ fontSize: 32, marginBottom: 4 }} />
        {fallbackText && <span style={{ fontSize: 13, fontWeight: 500 }}>{fallbackText}</span>}
      </div>
    );
  }

  return (
    <img
      src={resolvedSrc}
      alt={alt || 'image'}
      onError={handleError}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        display: 'block',
        ...style,
      }}
      {...props}
    />
  );
};

export default AppImage;
