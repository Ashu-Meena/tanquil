import HeroSection from "@/components/home/HeroSection";
import TrendingMosaic from "@/components/home/TrendingMosaic";
import BestSellers from "@/components/home/BestSellers";
import ShopByCategory from "@/components/home/ShopByCategory";
import NewCollection from "@/components/home/NewCollection";
import FashionStories from "@/components/home/FashionStories";
import Lookbook from "@/components/home/Lookbook";
import Reviews from "@/components/home/Reviews";
import WhyChooseUs from "@/components/home/WhyChooseUs";

export default function Home() {
  return (
    <>
      <HeroSection />
      <TrendingMosaic />
      <BestSellers />
      <ShopByCategory />
      <NewCollection />
      <FashionStories />
      <Lookbook />
      <Reviews />
      <WhyChooseUs />
    </>
  );
}
