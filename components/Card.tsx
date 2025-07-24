"use client";
import Image from 'next/image';
import { motion, Variants } from 'framer-motion';

type CardProps = {
  id: number;
  uniqueId: number;
  imageUrl: string;
  isFlipped: boolean;
  isMatched: boolean;
  isMissed: boolean;
  onCardClick: (uniqueId: number) => void;
};

const cardVariants: Variants = {
  closed: {
    rotateY: 0,
    transition: { type: "tween", ease: "easeOut", duration: 0.4 },
  },
  opened: {
    rotateY: 180,
    transition: { type: "tween", ease: "easeOut", duration: 0.4 },
  },
  missed: {
    x: [0, -10, 10, -10, 10, 0],
    transition: { duration: 0.5 },
  },
  matched: {
    rotateY: 180,
    transition: { type: "tween", ease: "easeOut", duration: 0.4 },
  },
};

export function Card({
  id,
  uniqueId,
  imageUrl,
  isFlipped,
  isMatched,
  isMissed,
  onCardClick,
}: CardProps) {
  const handleClick = () => {
    if (!isFlipped && !isMatched) {
      onCardClick(uniqueId);
    }
  };

  const getAnimationState = () => {
    if (isMatched) return "matched";
    if (isMissed) return "missed";
    if (isFlipped) return "opened";
    return "closed";
  };

  return (
    <div
      className="relative w-20 h-28 sm:w-24 sm:h-36 lg:w-32 lg:h-44 cursor-pointer [perspective:1000px]"
      onClick={handleClick}
    >
      <motion.div
        className="relative w-full h-full [transform-style:preserve-3d]"
        initial={false}
        variants={cardVariants}
        animate={getAnimationState()}
      >
        {!isMatched && (
          <div className="absolute w-full h-full [backface-visibility:hidden]">
            <Image
              src="/cards/card-back.png"
              alt="Card Back"
              layout="fill"
              className="object-cover rounded-lg shadow-lg"
            />
          </div>
        )}

        <div className="absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <Image
            src={imageUrl}
            alt={`Card ${id}`}
            layout="fill"
            className="object-cover rounded-lg shadow-lg"
          />
        </div>
      </motion.div>
    </div>
  );
}
