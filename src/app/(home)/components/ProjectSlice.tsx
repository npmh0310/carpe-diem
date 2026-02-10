'use client';

import { motion, MotionValue, useSpring, useTransform, useVelocity } from 'framer-motion';
import Image from 'next/image';
import { MaskText } from '@/components/common/MaskText';

interface ProjectSliceProps {
  src: string;
  title: string;
  category: string;
  index: number;
  total: number;
  progress: MotionValue<number>;
}

export const ProjectSlice = ({
  src,
  title,
  category,
  index,
  total,
  progress,
}: ProjectSliceProps) => {
  // Parallax effect: map global progress to local image movement
  const parallaxX = useTransform(progress, [0, 1], ['0%', '-20%']);

  // "Center focus" effect: card gần điểm focus được nhấn mạnh hơn.
  const focusPoint = total > 1 ? index / (total - 1) : 0;
  const itemStep = total > 1 ? 1 / (total - 1) : 1;

  // Độ "hoạt động" dựa theo vận tốc scroll – dừng lại thì activity → 0.
  const velocity = useVelocity(progress);
  const velocitySpring = useSpring(velocity, {
    // Damping cao hơn để hạ xuống mượt, ít giật
    mass: 0.6,
    stiffness: 90,
    damping: 40,
    restDelta: 0.0005,
  });
  const activity = useTransform(velocitySpring, (v) => {
    // Giảm độ nhạy và bỏ rung ở vận tốc rất nhỏ
    const raw = Math.min(1, Math.abs(v) * 8);
    return raw < 0.02 ? 0 : raw;
  });

  // Falloff mượt theo khoảng cách (tính bằng số card) từ điểm focus.
  const falloff = (dIndex: number) => {
    const sigma = 0.9;
    return Math.exp(-(dIndex * dIndex) / (2 * sigma * sigma));
  };

  // Sức mạnh hiệu ứng (0 → 1) cho từng card, phụ thuộc cả scroll progress và activity.
  const waveStrength = useTransform([progress, activity], (values) => {
    const p = (values[0] ?? 0) as number;
    const a = (values[1] ?? 0) as number;
    if (a <= 0.001) return 0;

    const dIndex = Math.abs(p - focusPoint) / itemStep;
    const f = falloff(dIndex); // 0..1 theo khoảng cách

    return f * a; // nhân với "hoạt động": dừng scroll thì tự mờ dần về 0
  });

  // Base nhỏ hơn 1 → khi ngừng scroll, card sẽ "thu nhỏ" lại nhẹ nhàng
  // Tăng biên độ khi scroll để card nổi bật hơn
  const baseScale = 0.88;
  const scale = useTransform(waveStrength, (w) => baseScale + 0.32 * w);
  const opacity = useTransform(waveStrength, (w) => 0.7 + 0.25 * w);
  // Giảm biên độ y để phase "hạ xuống" trông dịu và mượt hơn, không bị giật
  const y = useTransform(waveStrength, (w) => -4 * w);

  // Scroll-active color boost: card ở vùng focus bớt grayscale, sáng & đậm màu hơn
  const colorFilter = useTransform(waveStrength, (w) => {
    const grayscale = 1 - 0.7 * w; // 1 → 0.3
    const brightness = 0.5 + 0.35 * w; // 0.5 → 0.85
    const saturate = 0.6 + 0.7 * w; // 0.6 → 1.3
    return `grayscale(${grayscale}) brightness(${brightness}) saturate(${saturate})`;
  });

  return (
    <motion.div
      style={{ scale, opacity, y }}
      className="relative h-[45vh] w-[14vh] md:w-[18vh] min-w-[100px] shrink-0 overflow-hidden shadow-[0_10px_40px_-18px_rgba(0,0,0,0.6)] will-change-transform"
    >
      {/* Image Container with Parallax */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="relative w-[140%] h-full"
          style={{ x: parallaxX, filter: colorFilter }}
          whileHover={{ filter: 'grayscale(0) brightness(1.1) saturate(1.5)' }}
          transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
        >
          <Image
            src={src}
            alt={title}
            fill
            className="object-cover transition-all duration-500"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </motion.div>
      </div>

      {/* Readability gradient */}
      <div className="absolute inset-x-0 bottom-0 h-28 bg-linear-to-t from-black/70 via-black/25 to-transparent" />

      {/* Content Overlay */}
      <div className="absolute bottom-4 left-4 z-10 text-white mix-blend-difference">
        <div className="text-xs uppercase tracking-widest opacity-80 mb-1">
          {category}
        </div>
        <div className="text-2xl font-light uppercase tracking-tight">
          <MaskText>{title}</MaskText>
        </div>
      </div>
    </motion.div>
  );
};
