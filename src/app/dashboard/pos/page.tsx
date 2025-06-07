'use client';

import { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import './style.css';

type CartItem = {
  code: string;
  name: string;
  price: number;
  quantity: number;
};

export default function POSPage() {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showTotal, setShowTotal] = useState(false);
  const [total, setTotal] = useState(0);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    if (!scanning) return;

    const scanner = new Html5QrcodeScanner('reader', { fps: 10, qrbox: 250 }, false);

    scanner.render(
      (decodedText) => {
        console.log("スキャン成功:", decodedText);
        setCode(decodedText);
        fetchProductByCode(decodedText.trim());
        setScanning(false);
      },
      (error) => {
        // エラー無視でOK
      }
    );

    return () => {
      scanner.clear().catch(err => console.error(err));
    };
  }, [scanning]);

  const fetchProductByCode = async (scannedCode: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/product?code=${scannedCode}`);
      const data = await res.json();

      if (data && !data.message) {
        console.log("商品補完成功（DB）:", data);
        setName(data.name);
        setPrice(data.price.toString());
      } else {
        alert('商品が見つかりません（DB）');
        setName('');
        setPrice('');
      }
    } catch (error) {
      console.error("商品取得エラー:", error);
      alert('サーバーエラーが発生しました');
    }
  };

  const addToCart = () => {
    if (!code || !name || !price) return;
    const existing = cart.find(item => item.code === code);
    if (existing) {
      setCart(cart.map(item =>
        item.code === code
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { code, name, price: Number(price), quantity: 1 }]);
    }
    setCode('');
    setName('');
    setPrice('');
  };

  const handlePurchase = () => {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = Math.floor(subtotal * 0.1);
    setTotal(subtotal + tax);
    setShowTotal(true);
    setCart([]);
  };

  return (
    <main style={{ padding: '2rem', background: '#f9f9ff', fontFamily: 'sans-serif' }}>
      <img
        src="/bunpos_logo.png"
        alt="BunPOSロゴ"
        className="logo"  // ← これがないとCSS効かない！
      />

      <button
        onClick={() => setScanning(true)}
        style={{ background: '#9cf', padding: '1rem', marginBottom: '1rem' }}
      >
        スキャン（カメラ）
      </button>
      <div id="reader" style={{ width: '300px', marginBottom: '1rem' }} />

      <div>
        <input
          placeholder="商品コード"
          value={code}
          onChange={e => setCode(e.target.value)}
        /><br />
        <input
          placeholder="商品名"
          value={name}
          onChange={e => setName(e.target.value)}
        /><br />
        <input
          placeholder="単価"
          type="number"
          value={price}
          onChange={e => setPrice(e.target.value)}
        /><br />
        <button
          onClick={addToCart}
          style={{ background: '#39f', color: 'white', padding: '0.5rem 1rem', marginTop: '0.5rem' }}
        >
          追加
        </button>
      </div>

      <h2>購入リスト</h2>
      <div style={{ background: '#fff', padding: '1rem', marginBottom: '1rem' }}>
        {cart.length === 0 ? (
          <p>購入リストは空です</p>
        ) : (
          <ul>
            {cart.map(item => (
              <li key={item.code}>
                {item.name} ×{item.quantity} = {item.price * item.quantity}円
              </li>
            ))}
          </ul>
        )}
      </div>

      {cart.length > 0 && (
        <button
          onClick={handlePurchase}
          style={{ background: '#f66', color: 'white', padding: '0.5rem 1rem' }}
        >
          購入
        </button>
      )}

      {showTotal && (
        <div style={{ marginTop: '1rem', background: '#eef', padding: '1rem' }}>
          <p>合計金額（税込）：{total}円</p>
          <p style={{ fontStyle: 'italic', color: '#666' }}>
            今日も文具が心を癒やす…お疲れ様でした🖊️
          </p>
          <button onClick={() => setShowTotal(false)}>OK</button>
        </div>
      )}
    </main>
  );
}


