# Web3 Memory Game DApp

Ini adalah DApp full-stack yang dibangun dengan Next.js, RainbowKit, Wagmi v2, dan Solidity. Pemain dapat memainkan permainan memori, mengirimkan skor mereka secara on-chain, dan mengklaim hadiah STT jika skor mereka cukup tinggi.

## 🚀 Fitur

- **Permainan Memori:** Permainan kartu berbasis gambar klasik.
- **Skor On-Chain:** Skor akhir dihitung berdasarkan waktu dan upaya, lalu disimpan di blockchain.
- **Hadiah Kripto:** Pemain yang memenuhi syarat dapat mengklaim hadiah STT.
- **Papan Peringkat:** Menampilkan 10 pemain teratas secara on-chain.
- **Panel Admin:** Pemilik kontrak dapat mengelola dana dan pengaturan permainan.
- **Integrasi Web3 Modern:** Menggunakan Next.js App Router, RainbowKit, dan Wagmi v2 untuk pengalaman pengguna yang mulus.

## 📦 Stack Teknologi

- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS
- **Interaksi Web3:** RainbowKit & Wagmi v2
- **Smart Contract:** Solidity (^0.8.20)
- **Bahasa:** TypeScript

## 🛠️ Menjalankan Proyek Secara Lokal

### Prasyarat

- [Node.js](https://nodejs.org/en/) (v18 atau lebih baru)
- [pnpm](https://pnpm.io/) (direkomendasikan) atau npm/yarn
- Wallet browser seperti [MetaMask](https://metamask.io/)
- STT Testnet (misalnya dari [Sepolia Faucet](https://sepoliafaucet.com/))

### Langkah 1: Deploy Smart Contract

1.  **Siapkan Lingkungan Hardhat/Foundry:**
    Proyek ini tidak menyertakan file konfigurasi Hardhat. Anda perlu menyiapkannya secara terpisah.

    - Instal Hardhat: `pnpm add --save-dev hardhat @nomicfoundation/hardhat-toolbox`
    - Jalankan `npx hardhat` dan buat proyek TypeScript.
    - Pindahkan `contracts/MemoryGame.sol` ke direktori `contracts` Hardhat Anda.
    - Instal kontrak OpenZeppelin: `pnpm add @openzeppelin/contracts`.

2.  **Buat Skrip Deploy:**
    Buat file di `scripts/deploy.ts` dalam proyek Hardhat Anda:
    ```typescript
    import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const SomniaMemoryModule = buildModule("SomniaMemoryModule", (m) => {
const initialMinScore = m.getParameter("\_initialMinScore", 1000);
const SomniaMemory = m.contract("SomniaMemory", [initialMinScore]);

return { SomniaMemory };
});

export default SomniaMemoryModule;
```

3.  **Deploy ke Testnet:**

    - Konfigurasikan file `hardhat.config.ts` Anda dengan URL RPC testnet dan private key deployer.
    - Jalankan skrip deploy: `npx hardhat run scripts/deploy.ts --network sepolia` (ganti `sepolia` dengan jaringan Anda).

4.  **Dapatkan ABI:**
    Setelah kompilasi (`npx hardhat compile`), ABI akan dibuat di `artifacts/contracts/MemoryGame.sol/MemoryGame.json`. Salin konten array `abi` dari file ini.

### Langkah 2: Konfigurasi Frontend

1.  **Clone Repositori:**

    ```bash
    git clone <URL_REPO_ANDA>
    cd <NAMA_REPO>
    ```

2.  **Instal Dependensi:**

    ```bash
    pnpm install
    ```

3.  **Salin ABI:**
    Tempel ABI yang Anda salin dari Hardhat ke dalam file `lib/abi.ts`.

4.  **Siapkan Variabel Lingkungan:**
    - Buat file `.env.local` dengan menyalin dari `.env.example`.
    - `NEXT_PUBLIC_CONTRACT_ADDRESS`: Isi dengan alamat kontrak yang Anda deploy.
    - `NEXT_PUBLIC_CHAIN_ID`: ID chain tempat Anda deploy (misalnya `11155111` untuk Sepolia).
    - `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`: Dapatkan ID proyek dari [WalletConnect Cloud](https://cloud.walletconnect.com/).

### Langkah 3: Jalankan Aplikasi

1.  **Jalankan Server Development:**

    ```bash
    pnpm dev
    ```

2.  **Buka di Browser:**
    Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

### Langkah 4: Interaksi dengan DApp

1.  **Danai Kontrak (Sebagai Owner):**

    - Buka halaman `/admin`.
    - Hubungkan dengan wallet yang sama dengan yang Anda gunakan untuk deploy (wallet owner).
    - Gunakan form "Deposit" untuk mengirim STT testnet ke kontrak. Dana ini akan digunakan untuk hadiah.

2.  **Mainkan Game:**

    - Buka halaman `/play`.
    - Selesaikan permainan. Jika skor Anda cukup tinggi, Anda akan melihat opsi untuk mengklaim hadiah.

3.  **Klaim Hadiah:**

    - Klik tombol "Submit Score".
    - Jika skor Anda memenuhi syarat, klik tombol "Claim Reward".

4.  **Lihat Papan Peringkat:**
    - Buka halaman `/leaderboard` untuk melihat skor teratas.
