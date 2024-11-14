interface WatchlistCar {}

type CarsListContext = "stock" | "followed" | "search" | "chats" | "swiper" | "add-stock";

interface SelectedImage {
  name: string | null;
  type: string | undefined;
  uri: string | undefined;
  size: number | undefined;
  index: number | undefined;
  isPlaceholder?: boolean;
}
