import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-fade';
import { midbitImages } from '../assets/assets'

const MidBitCarousel = () => {
  return (
    <Swiper
      loop={true}
      spaceBetween={0}
      slidesPerView={1}
      centeredSlides={true}
      autoplay={{
        delay: 3000,
        disableOnInteraction: false,
      }}
      pagination={{
        clickable: true,
      }}
      navigation={true}
      effect="fade"
      fadeEffect={{ crossFade: false }}
      speed={5000}
      modules={[Autoplay, Pagination, Navigation, EffectFade]}
      className="mySwiper"
    >
      {midbitImages.map((image, index) => (
        <SwiperSlide key={index}>
          <img src={image} alt={`Slide ${index + 1}`} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default MidBitCarousel;