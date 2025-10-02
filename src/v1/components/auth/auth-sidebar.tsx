import { Carousel, carouselItems } from "../carousel";
import GlobeWrapper from "../globe";

export function AuthSidebar() {
    return (
        <div className="w-[60%] hidden md:block h-full px-10 py-1 bg-primary relative">
            <div className="mt-12">
                <Carousel data={carouselItems} interval={4000} />
            </div>
            <div className="absolute bottom-5 left-5 px-5 right-0 flex justify-start items-center mt-6 text-white text-lg z-10">
                &copy; {new Date().getFullYear()} Rojifi. All rights reserved.
            </div>
            <div className="absolute -bottom-40 -right-40 flex justify-center items-center mt-6">
                <GlobeWrapper />
            </div>
        </div>
    );
}