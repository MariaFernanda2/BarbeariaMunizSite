"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

import Image from "next/image";

export default function Carousel({ items }: { items: any[] }) {
  if (!items.length) return null;

  return (
    <div className="object-cover rounded-2xl hover:scale-105 transition">
      <Swiper
        modules={[Autoplay]}
        spaceBetween={16}
        slidesPerView={"auto"}
        autoplay={{
          delay: 2500,
          disableOnInteraction: false,
        }}
        loop={true}
      >
        {items.map((item) => (
          <SwiperSlide key={item.id} className="!w-[167px]">
            <div className="w-full h-[159px] relative">
              <Image
                src={item.image_url}
                alt={item.title || "Corte"}
                fill
                className="object-cover rounded-2xl"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}