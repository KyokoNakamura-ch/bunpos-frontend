'use client';

import { useEffect, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import './dashboard/pos/style.css'; // このパスのままでOK

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

    Html5Qrcode.getCameras().then(cameras => {
      if (cameras && cameras.length) {
        console.log("カメラ一覧:", cameras.map(c => c.label));

        // 背面カメラ優先で選択
        const backCam = cameras.find(cam =>
          cam.label.toLowerCase().includes('back') ||
          cam.label.toLowerCase().includes('rear')
        ) || (cameras.length >= 2 ? cameras[1] : cameras[0]);

        const html5QrCode = new Html5Qrcode('reader');

        html5QrCode.start(
          backCam.id, // ← ← ← ★ここが今回の修正ポイント★
          { fps: 10, qrbox: 250 },
          decodedText => {
            console.log("スキャン成功:", decodedText);
            setCode(decodedText);
            fetchProductByCode(decodedText.trim());
            setScanning(false);
            html5QrCode.stop().then(() => html5QrCode.clear());
          },
          error => {
            console.warn("スキャンエラー:", error);
          }
        );
      } else {
        alert('カメラが見つかりません');
      }
    });

    return () => {
      const scanner = new Html5Qrcode('reader');
      try {
        scanner.clear();
      } catch (err) {
        console.error(err);
      }
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
      <p style={{ color: 'red', fontWeight: 'bold' }}>【✅ ver_20250609 確認用：カメラ設定テスト中】</p>

      <img
        src="/bunpos_logo.png"
        alt="BunPOSロゴ"
        className="logo"
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


// 'use client';

// import { useEffect, useState } from 'react';
// import { Html5Qrcode, Html5QrcodeScanner } from 'html5-qrcode';
// import './style.css';

// type CartItem = {
//   code: string;
//   name: string;
//   price: number;
//   quantity: number;
// };

// export default function POSPage() {
//   const [code, setCode] = useState('');
//   const [name, setName] = useState('');
//   const [price, setPrice] = useState('');
//   const [cart, setCart] = useState<CartItem[]>([]);
//   const [showTotal, setShowTotal] = useState(false);
//   const [total, setTotal] = useState(0);
//   const [scanning, setScanning] = useState(false);

//   useEffect(() => {
//     if (!scanning) return;

//     Html5Qrcode.getCameras().then(cameras => {
//       if (cameras && cameras.length > 0) {
//         const backCam = cameras.find(cam =>
//           cam.label.toLowerCase().includes('back')
//         ) || cameras[0];

//         const html5QrCode = new Html5Qrcode('reader');

//         html5QrCode.start(
//           backCam.id,
//           { fps: 10, qrbox: 250 },
//           decodedText => {
//             console.log("スキャン成功:", decodedText);
//             setCode(decodedText);
//             fetchProductByCode(decodedText.trim());
//             setScanning(false);

//             html5QrCode.stop().then(() => {
//               try {
//                 html5QrCode.clear();
//               } catch (err) {
//                 console.error('clear中にエラー:', err);
//               }
//             });
//           },
//           error => {
//             // エラーは無視
//           }
//         );
//       }
//     });

//     return () => {
//       const scanner = new Html5Qrcode('reader');
//       try {
//         scanner.clear();
//       } catch (err) {
//         console.error('アンマウント時のclearエラー:', err);
//       }
//     };
//   }, [scanning]);

//   const fetchProductByCode = async (scannedCode: string) => {
//     try {
//       const res = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/product?code=${scannedCode}`);
//       const data = await res.json();

//       if (data && !data.message) {
//         console.log("商品補完成功（DB）:", data);
//         setName(data.name);
//         setPrice(data.price.toString());
//       } else {
//         alert('商品が見つかりません（DB）');
//         setName('');
//         setPrice('');
//       }
//     } catch (error) {
//       console.error("商品取得エラー:", error);
//       alert('サーバーエラーが発生しました');
//     }
//   };

//   const addToCart = () => {
//     if (!code || !name || !price) return;
//     const existing = cart.find(item => item.code === code);
//     if (existing) {
//       setCart(cart.map(item =>
//         item.code === code
//           ? { ...item, quantity: item.quantity + 1 }
//           : item
//       ));
//     } else {
//       setCart([...cart, { code, name, price: Number(price), quantity: 1 }]);
//     }
//     setCode('');
//     setName('');
//     setPrice('');
//   };

//   const handlePurchase = () => {
//     const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
//     const tax = Math.floor(subtotal * 0.1);
//     setTotal(subtotal + tax);
//     setShowTotal(true);
//     setCart([]);
//   };

//   return (
//     <main style={{ padding: '2rem', background: '#f9f9ff', fontFamily: 'sans-serif' }}>
//       <img
//         src="/bunpos_logo.png"
//         alt="BunPOSロゴ"
//         className="logo"
//       />

//       <button
//         onClick={() => setScanning(true)}
//         style={{ background: '#9cf', padding: '1rem', marginBottom: '1rem' }}
//       >
//         スキャン（カメラ）
//       </button>
//       <div id="reader" style={{ width: '300px', marginBottom: '1rem' }} />

//       <div>
//         <input
//           placeholder="商品コード"
//           value={code}
//           onChange={e => setCode(e.target.value)}
//         /><br />
//         <input
//           placeholder="商品名"
//           value={name}
//           onChange={e => setName(e.target.value)}
//         /><br />
//         <input
//           placeholder="単価"
//           type="number"
//           value={price}
//           onChange={e => setPrice(e.target.value)}
//         /><br />
//         <button
//           onClick={addToCart}
//           style={{ background: '#39f', color: 'white', padding: '0.5rem 1rem', marginTop: '0.5rem' }}
//         >
//           追加
//         </button>
//       </div>

//       <h2>購入リスト</h2>
//       <div style={{ background: '#fff', padding: '1rem', marginBottom: '1rem' }}>
//         {cart.length === 0 ? (
//           <p>購入リストは空です</p>
//         ) : (
//           <ul>
//             {cart.map(item => (
//               <li key={item.code}>
//                 {item.name} ×{item.quantity} = {item.price * item.quantity}円
//               </li>
//             ))}
//           </ul>
//         )}
//       </div>

//       {cart.length > 0 && (
//         <button
//           onClick={handlePurchase}
//           style={{ background: '#f66', color: 'white', padding: '0.5rem 1rem' }}
//         >
//           購入
//         </button>
//       )}

//       {showTotal && (
//         <div style={{ marginTop: '1rem', background: '#eef', padding: '1rem' }}>
//           <p>合計金額（税込）：{total}円</p>
//           <p style={{ fontStyle: 'italic', color: '#666' }}>
//             今日も文具が心を癒やす…お疲れ様でした🖊️
//           </p>
//           <button onClick={() => setShowTotal(false)}>OK</button>
//         </div>
//       )}
//     </main>
//   );
// }

// import Image from "next/image";

// export default function Home() {
//   return (
//     <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
//       <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
//         <Image
//           className="dark:invert"
//           src="/next.svg"
//           alt="Next.js logo"
//           width={180}
//           height={38}
//           priority
//         />
//         <ol className="list-inside list-decimal text-sm/6 text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
//           <li className="mb-2 tracking-[-.01em]">
//             Get started by editing{" "}
//             <code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-[family-name:var(--font-geist-mono)] font-semibold">
//               src/app/page.tsx
//             </code>
//             .
//           </li>
//           <li className="tracking-[-.01em]">
//             Save and see your changes instantly.
//           </li>
//         </ol>

//         <div className="flex gap-4 items-center flex-col sm:flex-row">
//           <a
//             className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
//             href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             <Image
//               className="dark:invert"
//               src="/vercel.svg"
//               alt="Vercel logomark"
//               width={20}
//               height={20}
//             />
//             Deploy now
//           </a>
//           <a
//             className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
//             href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             Read our docs
//           </a>
//         </div>
//       </main>
//       <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
//         <a
//           className="flex items-center gap-2 hover:underline hover:underline-offset-4"
//           href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           <Image
//             aria-hidden
//             src="/file.svg"
//             alt="File icon"
//             width={16}
//             height={16}
//           />
//           Learn
//         </a>
//         <a
//           className="flex items-center gap-2 hover:underline hover:underline-offset-4"
//           href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           <Image
//             aria-hidden
//             src="/window.svg"
//             alt="Window icon"
//             width={16}
//             height={16}
//           />
//           Examples
//         </a>
//         <a
//           className="flex items-center gap-2 hover:underline hover:underline-offset-4"
//           href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           <Image
//             aria-hidden
//             src="/globe.svg"
//             alt="Globe icon"
//             width={16}
//             height={16}
//           />
//           Go to nextjs.org →
//         </a>
//       </footer>
//     </div>
//   );
// }
