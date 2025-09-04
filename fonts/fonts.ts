import {
  Inter,
  Playpen_Sans,
  Plus_Jakarta_Sans,
  Luckiest_Guy,
} from "next/font/google";

export const inter = Inter({ subsets: ["latin"] });

export const playpen = Playpen_Sans({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-poppins",
});

export const plusJakarta = Plus_Jakarta_Sans({
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  subsets: ["latin"],
  display: "swap",
});

export const luckiestGuy = Luckiest_Guy({
  weight: ["400"],
  subsets: ["latin"],
  display: "swap",
});
