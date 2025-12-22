import React from "react";

/**
 * 暗号化されたフィード1件の型
 * ※ 必要に応じて fields を増やしてOK
 */
export interface EncryptedFeedItem {
  id: string;
  ciphertext: string;
  createdAt?: string;
}

/**
 * Props
 */
interface EncryptedFeedProps {
  items?: EncryptedFeedItem[];
}

const EncryptedFeed: React.FC<EncryptedFeedProps> = ({ items = [] }) => {
  return (
    <div className="encrypted-feed">
      {items.length === 0 ? (
        <p>Encrypted items not found.</p>
      ) : (
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              <pre>{item.ciphertext}</pre>
              {item.createdAt && (
                <small>{new Date(item.createdAt).toLocaleString()}</small>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default EncryptedFeed;