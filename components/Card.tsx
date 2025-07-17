"use client";
import Image from 'next/image';
import { motion, Variants } from 'framer-motion';

type CardProps = {
  id: number;
  uniqueId: number;
  imageUrl: string;
  isFlipped: boolean;
  isMatched: boolean;
  isMissed: boolean; // <-- PROPS BARU DITERIMA DI SINI
  onCardClick: (uniqueId: number) => void;
};

// --> VARIANTS ANIMASI UNTUK KARTU <--
const cardVariants: Variants = {
  // Keadaan default (tertutup)
  closed: {
    rotateY: 0,
    transition: { type: "tween", ease: "easeOut", duration: 0.4 }
  },
  // Keadaan terbuka
  opened: {
    rotateY: 180,
    transition: { type: "tween", ease: "easeOut", duration: 0.4 }
  },
  // Keadaan salah pilih (bergoyang)
  missed: {
    x: [0, -10, 10, -10, 10, 0], // Animasi goyang sumbu X
    transition: { duration: 0.5 },
  }
};

export function Card({ id, uniqueId, imageUrl, isFlipped, isMatched, isMissed, onCardClick }: CardProps) {
  const handleClick = () => {
    if (!isFlipped && !isMatched) {
      onCardClick(uniqueId);
    }
  };
  
  // Menentukan animasi mana yang harus dijalankan
  const getAnimationState = () => {
    if(isMissed) return "missed";
    if(isFlipped || isMatched) return "opened";
    return "closed";
  }

  return (
    <div
      className="relative w-24 h-36 md:w-32 md:h-48 cursor-pointer [perspective:1000px]"
      onClick={handleClick}
    >
      <motion.div
        className="relative w-full h-full [transform-style:preserve-3d]"
        initial={false}
        variants={cardVariants} // Gunakan variants yang sudah didefinisikan
        animate={getAnimationState()} // Pilih state animasi secara dinamis
      >
        {/* Card Back */}
        <div className="absolute w-full h-full [backface-visibility:hidden]">
          <Image src="/cards/card-back.png" alt="Card Back" layout="fill" className="object-cover rounded-lg shadow-lg" />
        </div>
        {/* Card Front */}
        <div className="absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <Image src={imageUrl} alt={`Card ${id}`} layout="fill" className="object-cover rounded-lg shadow-lg" />
        </div>
      </motion.div>
    </div>
  );
}